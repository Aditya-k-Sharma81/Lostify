const DiscoveryReport = require('../models/DiscoveryReport');
const LostItem = require('../models/LostItem');
const User = require('../models/User'); // Fixed: Added User model import
const nodemailer = require('nodemailer');
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

// Load MobileNet model once
let net;
const loadModel = async () => {
    if (!net) {
        net = await mobilenet.load();
    }
    return net;
};

// Helper: Get Image Embedding
const getEmbedding = async (imageUrl) => {
    const image = await loadImage(imageUrl);

    // Resize to 224x224 (MobileNet expected input size)
    const SIZE = 224;
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, SIZE, SIZE);

    // Get raw pixel data (Uint8ClampedArray: RGBA)
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const { data } = imageData;

    // Convert RGBA to RGB Float32 and create a tf.tensor3d
    const rgbData = new Float32Array(SIZE * SIZE * 3);
    for (let i = 0; i < SIZE * SIZE; i++) {
        rgbData[i * 3] = data[i * 4] / 255; // R
        rgbData[i * 3 + 1] = data[i * 4 + 1] / 255; // G
        rgbData[i * 3 + 2] = data[i * 4 + 2] / 255; // B
    }
    const imgTensor = tf.tensor3d(rgbData, [SIZE, SIZE, 3]);

    const model = await loadModel();
    // model.infer expects a 4D tensor [batch, height, width, channels]
    const batched = imgTensor.expandDims(0);
    const activation = model.infer(batched, true);
    const embedding = activation.dataSync();

    // Clean up tensors to avoid memory leaks
    imgTensor.dispose();
    batched.dispose();
    activation.dispose();

    return embedding;
};

// Helper: Cosine Similarity
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] ** 2;
        normB += vecB[i] ** 2;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

exports.submitDiscoveryReport = async (req, res) => {
    try {
        const { lostItemId, discoveryDate, discoveryLocation, discoveryDesc } = req.body;

        // Fix: req.user is set as the ID string in auth middleware
        const reporterId = req.user;

        if (!lostItemId || !discoveryDate || !discoveryLocation || !discoveryDesc) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const lostItem = await LostItem.findById(lostItemId).populate('user');
        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item not found' });
        }

        const reporter = await User.findById(reporterId); // Fetch full reporter object for name
        if (!reporter) {
            return res.status(404).json({ message: 'Reporter not found' });
        }

        const discoveryPhotoUrls = req.files ? req.files.map(file => file.path) : [];
        if (discoveryPhotoUrls.length === 0) {
            return res.status(400).json({ message: 'At least one photo is required for verification' });
        }

        // Similarity Check (Owner Pics vs Reporter Pics)
        const ownerPhotos = lostItem.images;
        const reporterPhotos = discoveryPhotoUrls;

        let totalSimilarityScore = 0;
        let similarityScore = 0;
        try {
            // 1. Get embeddings for all owner photos
            const ownerEmbeddings = await Promise.all(ownerPhotos.map(url => getEmbedding(url)));

            // 2. Iterate through reporter photos and check similarity
            for (const reporterPic of reporterPhotos) {
                const reporterEmbedding = await getEmbedding(reporterPic);
                let maxSimilarityForThisPhoto = 0;

                for (const ownerEmbedding of ownerEmbeddings) {
                    const similarity = cosineSimilarity(reporterEmbedding, ownerEmbedding);
                    if (similarity > maxSimilarityForThisPhoto) {
                        maxSimilarityForThisPhoto = similarity;
                    }
                }

                console.log(`Max Similarity for photo ${reporterPic}: ${maxSimilarityForThisPhoto}`);

                // If any reporter photo doesn't match ANY owner photo, fail.
                if (maxSimilarityForThisPhoto < 0.85) {
                    return res.status(400).json({ message: 'Photo is not similar enough.' });
                }
                totalSimilarityScore += maxSimilarityForThisPhoto;
            }

            // Calculate average similarity score for the report record
            similarityScore = totalSimilarityScore / reporterPhotos.length;
            console.log(`Final Average Similarity Score: ${similarityScore}`);
        } catch (err) {
            console.error('AI Similarity Error:', err);
            return res.status(500).json({ message: 'Error during image verification' });
        }

        // Save Report
        const newReport = new DiscoveryReport({
            reporter: reporterId,
            lostItem: lostItemId,
            discoveryDate,
            discoveryLocation,
            discoveryDesc,
            discoveryPhotos: discoveryPhotoUrls,
            similarityScore: similarityScore * 100
        });

        await newReport.save();

        // Send Email to Owner
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Skipping email notification: EMAIL_USER or EMAIL_PASS not set in .env');
            return res.status(201).json({
                message: 'Report submitted successfully. (Email notification skipped - credentials missing)',
                report: newReport
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: lostItem.user.email,
            subject: `Discovery Report: Someone found your ${lostItem.itemName}!`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
                    <h2 style="color: #333; text-align: center;">Good News!</h2>
                    <p>Someone has reported finding an item that matches your <strong>${lostItem.itemName}</strong>.</p>
                    
                    <div style="background: #fdfdfd; padding: 15px; border-radius: 8px; border: 1px solid #f0f0f0; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #555;">Reporter Details:</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 8px;"><strong>Name:</strong> ${reporter.name}</li>
                            <li style="margin-bottom: 8px;"><strong>Discovery Date:</strong> ${new Date(discoveryDate).toLocaleDateString()}</li>
                            <li style="margin-bottom: 8px;"><strong>Location:</strong> ${discoveryLocation}</li>
                        </ul>
                    </div>

                    <h3 style="color: #555;">Discovery Description:</h3>
                    <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; font-style: italic; color: #666; border-left: 4px solid #000;">${discoveryDesc}</p>

                    <div style="margin-top: 30px;">
                        <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Comparison Gallery</h3>
                        
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #666; margin-bottom: 10px;">Your Original Photos:</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                ${lostItem.images.map(img => `
                                    <img src="${img}" style="width: 140px; height: 140px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;"/>
                                `).join('')}
                            </div>
                        </div>

                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #666; margin-bottom: 10px;">Reporter's Photos:</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                ${discoveryPhotoUrls.map(img => `
                                    <img src="${img}" style="width: 140px; height: 140px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;"/>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 10px;">
                        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2e7d32;">AI Similarity Match: ${(similarityScore * 100).toFixed(2)}%</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #888; font-size: 14px;">Please log in to the portal to view more details and coordinate the recovery.</p>
                        <a href="http://localhost:5173" style="display: inline-block; background: #000; color: #fff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Dashboard</a>
                    </div>
                </div>
            `
        };

        // Wrap sendMail in a Promise to wait for it before responding
        try {
            await new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Email Error:', error);
                        reject(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        resolve(info);
                    }
                });
            });

            res.status(201).json({
                message: 'Report submitted successfully and the owner has been notified via email.',
                report: newReport
            });
        } catch (emailError) {
            // If email fails, we still have the report saved in DB
            res.status(201).json({
                message: 'Report submitted successfully, but the email notification failed. Please check your SMTP settings.',
                report: newReport,
                emailError: emailError.message
            });
        }


    } catch (err) {
        console.error('Discovery Submit Error:', err);
        res.status(500).json({ message: 'Server error while submitting discovery report' });
    }
};

exports.getReportsForMyLostItems = async (req, res) => {
    try {
        // Find all lost items belonging to this user
        const myLostItems = await LostItem.find({ user: req.user });
        const myLostItemIds = myLostItems.map(item => item._id);

        // Find all discovery reports for these items
        const reports = await DiscoveryReport.find({ lostItem: { $in: myLostItemIds } })
            .populate('lostItem')
            .populate({
                path: 'reporter',
                select: 'name email phone profilePic'
            })
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (err) {
        console.error('Error fetching reports for my items:', err);
        res.status(500).json({ message: 'Server error while fetching claims' });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const report = await DiscoveryReport.findById(id)
            .populate({
                path: 'lostItem',
                populate: { path: 'user', select: 'name email' }
            })
            .populate('reporter', 'name email');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Verify that the user updating the status is the owner of the lost item
        if (report.lostItem.user._id.toString() !== req.user) {
            return res.status(403).json({ message: 'Not authorized to update this report' });
        }

        report.status = status;
        await report.save();

        // If accepted, mark the lost item as accepted
        if (status === 'accepted') {
            await LostItem.findByIdAndUpdate(report.lostItem._id, { status: 'accepted' });
        }

        // Send Email Notification to Reporter
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const ownerName = report.lostItem.user.name;
            const itemName = report.lostItem.itemName;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: report.reporter.email,
                subject: `Update on your Claim: ${status === 'accepted' ? 'Accepted' : 'Dismissed'}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
                        <h2 style="color: ${status === 'accepted' ? '#10b981' : '#ef4444'}; text-align: center;">
                            Claim ${status === 'accepted' ? 'Accepted!' : 'Dismissed'}
                        </h2>
                        <p>Hi <strong>${report.reporter.name}</strong>,</p>
                        <p>The owner of the <strong>${itemName}</strong> (${ownerName}) has ${status === 'accepted' ? 'accepted' : 'dismissed'} your claim.</p>
                        
                        ${status === 'accepted' ? `
                            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #dcfce7; margin: 20px 0;">
                                <p style="margin: 0; color: #166534; font-weight: bold;">Congratulations! Your claim has been verified.</p>
                                <p style="margin-top: 10px; font-size: 14px; color: #166534;">The owner will reach out to you soon to coordinate the transfer. You can also view more details on your dashboard.</p>
                            </div>
                        ` : `
                            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fee2e2; margin: 20px 0;">
                                <p style="margin: 0; color: #991b1b; font-weight: bold;">The owner has dismissed this claim.</p>
                                <p style="margin-top: 10px; font-size: 14px; color: #991b1b;">It seems the details or photos provided did not match the owner's records. Thank you for your effort in helping the community.</p>
                            </div>
                        `}

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173" style="display: inline-block; background: #000; color: #fff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
                        </div>
                    </div>
                `
            };

            // Non-blocking email send
            transporter.sendMail(mailOptions).catch(err => console.error('Reporter Email Error:', err));
        }

        res.json({ message: `Report ${status} successfully and reporter notified.`, report });
    } catch (err) {
        console.error('Error updating report status:', err);
        res.status(500).json({ message: 'Server error while updating status' });
    }
};

exports.getAcceptedReports = async (req, res) => {
    try {
        // Find all lost items belonging to this user that have been marked as accepted
        const myLostItems = await LostItem.find({ user: req.user });
        const myLostItemIds = myLostItems.map(item => item._id);

        const reports = await DiscoveryReport.find({
            status: 'accepted',
            lostItem: { $in: myLostItemIds }
        })
            .populate({
                path: 'lostItem',
                populate: {
                    path: 'user',
                    select: 'name email phone profilePic'
                }
            })
            .populate('reporter', 'name email phone profilePic')
            .sort({ updatedAt: -1 });

        res.json(reports);
    } catch (err) {
        console.error('Error fetching accepted reports:', err);
        res.status(500).json({ message: 'Server error while fetching accepted reports' });
    }
};

