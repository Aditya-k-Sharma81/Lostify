const DiscoveryReport = require('../models/DiscoveryReport');
const LostItem = require('../models/LostItem');
const User = require('../models/User');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
console.log('Resend API Key loaded:', process.env.RESEND_API_KEY ? 'YES' : 'NO');


const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const https = require('https');
const http = require('http');
const { createCanvas, loadImage } = require('canvas');

// ─────────────────────────────────────────────────────────────────────────────
// Image Similarity: AI Object Similarity (MobileNet)
// This uses MobileNet embeddings (feature vectors) to compare images.
// ─────────────────────────────────────────────────────────────────────────────

let model;

/**
 * Loads the MobileNet model.
 */
const loadModel = async () => {
    try {
        if (!model) {
            model = await mobilenet.load();
            console.log('✅ MobileNet Model Loaded Successfully');
        }
    } catch (err) {
        console.error('❌ Failed to load MobileNet model:', err);
    }
};

// Initialize model on startup
loadModel();

/**
 * Downloads an image from a URL and returns a Buffer.
 */
const downloadImageBuffer = (url) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const agent = new https.Agent({ rejectUnauthorized: false });
        client.get(url, { agent }, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
};

/**
 * Extracts embeddings (feature vector) from an image buffer using MobileNet.
 */
const extractEmbeddings = async (imageBuffer) => {
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(224, 224);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 224, 224);

    return tf.tidy(() => {
        const tensor = tf.browser.fromPixels(canvas);
        // Use model.infer to get the internal activation (embedding)
        const embedding = model.infer(tensor, true);
        return embedding.flatten();
    });
};

/**
 * Calculates Cosine Similarity between two embedding tensors.
 */
const calculateCosineSimilarity = (tensorA, tensorB) => {
    return tf.tidy(() => {
        // Ensure tensors are 1D vectors
        const vecA = tensorA.flatten();
        const vecB = tensorB.flatten();

        const normA = tf.norm(vecA);
        const normB = tf.norm(vecB);

        // Use tf.dot for vector dot product (more robust than matMul for 1D)
        const dotProduct = tf.dot(vecA, vecB);

        const similarity = dotProduct.div(normA.mul(normB));
        return similarity.dataSync()[0];
    });
};

exports.submitDiscoveryReport = async (req, res) => {
    try {
        const { lostItemId, discoveryDate, discoveryLocation, discoveryDesc } = req.body;

        // Fix: req.user is set as the ID string in auth middleware
        const reporterId = req.user;

        if (!lostItemId || !discoveryDate || !discoveryLocation || !discoveryDesc) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        const lostItem = await LostItem.findById(lostItemId).populate('user');
        if (!lostItem) {
            return res.json({ success: false, message: 'Lost item not found' });
        }

        const reporter = await User.findById(reporterId); // Fetch full reporter object for name
        if (!reporter) {
            return res.json({ success: false, message: 'Reporter not found' });
        }

        const discoveryPhotoUrls = req.files ? req.files.map(file => file.path) : [];
        if (discoveryPhotoUrls.length === 0) {
            return res.json({ success: false, message: 'At least one photo is required for verification' });
        }

        // ── AI Object Similarity Check ──────────────────────────────────
        // Rule: EVERY reporter photo must match AT LEAST ONE owner photo.
        //       Threshold for a single match: 85% (0.85)
        // ──────────────────────────────────────────────────────────────────────
        const SIMILARITY_THRESHOLD = 0.85;

        const ownerPhotos = lostItem.images;
        const reporterPhotos = discoveryPhotoUrls;

        let totalBestMatchScore = 0;
        let similarityScore = 0;

        try {
            // Ensure model is loaded
            if (!model) await loadModel();

            // 1. Extract embeddings for all owner photos
            const ownerEmbeddings = [];
            for (let i = 0; i < ownerPhotos.length; i++) {
                const url = ownerPhotos[i];
                const buffer = await downloadImageBuffer(url);
                const emb = await extractEmbeddings(buffer);
                ownerEmbeddings.push({ embedding: emb, url: url });
            }

            // 2. Each reporter photo must find at least one match in ownerEmbeddings
            for (let ri = 0; ri < reporterPhotos.length; ri++) {
                const reporterUrl = reporterPhotos[ri];
                const reporterBuffer = await downloadImageBuffer(reporterUrl);
                const reporterEmb = await extractEmbeddings(reporterBuffer);

                let hasAtLeastOneMatch = false;
                let bestSimilarityForThisPhoto = 0;
                let bestMatchOwnerIndex = -1;

                console.log(`\n[Checking Reporter Photo ${ri + 1}/${reporterPhotos.length}]`);
                console.log(`URL: ${reporterUrl}`);

                for (let oi = 0; oi < ownerEmbeddings.length; oi++) {
                    const ownerEntry = ownerEmbeddings[oi];
                    const sim = calculateCosineSimilarity(reporterEmb, ownerEntry.embedding);

                    if (sim > bestSimilarityForThisPhoto) {
                        bestSimilarityForThisPhoto = sim;
                        bestMatchOwnerIndex = oi;
                    }
                    if (sim >= SIMILARITY_THRESHOLD) {
                        hasAtLeastOneMatch = true;
                    }
                }

                // Detailed console report as requested
                console.log(`-----------------------------------------`);
                console.log(`Reporter Image: Photo ${ri + 1}`);
                if (bestMatchOwnerIndex !== -1) {
                    console.log(`Matched with: Owner Photo ${bestMatchOwnerIndex + 1}`);
                    console.log(`Similarity: ${(bestSimilarityForThisPhoto * 100).toFixed(2)}%`);
                }
                console.log(`Status: ${hasAtLeastOneMatch ? '✅ PASSED' : '❌ FAILED'} (Threshold: ${SIMILARITY_THRESHOLD * 100}%)`);
                console.log(`-----------------------------------------`);

                // Add best match for this reporter photo to total (for overall average)
                totalBestMatchScore += bestSimilarityForThisPhoto;

                // Dispose of reporter embedding tensor
                reporterEmb.dispose();

                if (!hasAtLeastOneMatch) {
                    console.log(`❌ FAIL: Reporter photo ${ri + 1} did not match any owner photos above 85%.`);

                    // Dispose of owner embedding tensors before returning
                    ownerEmbeddings.forEach(entry => entry.embedding.dispose());

                    return res.json({
                        success: false,
                        message: 'Photo is not similar enough.'
                    });
                }
            }

            // Calculate final average similarity score for the whole report
            similarityScore = totalBestMatchScore / reporterPhotos.length;

            // Dispose of owner embedding tensors
            ownerEmbeddings.forEach(entry => entry.embedding.dispose());

            console.log(`\n[ALL PHOTOS VERIFIED SUCCESSFULLY]`);
            console.log(`Overall Similarity Score for Report: ${(similarityScore * 100).toFixed(2)}%`);
        } catch (err) {
            console.error('AI Image Comparison Error:', err);
            return res.json({ success: false, message: 'Error during AI image verification' });
        }

        // Save Report
        const newReport = new DiscoveryReport({
            reporter: reporterId,
            lostItem: lostItemId,
            discoveryDate,
            discoveryLocation,
            discoveryDesc,
            discoveryPhotos: discoveryPhotoUrls,
            similarityScore: similarityScore
        });

        await newReport.save();

        // Send Email to Owner via Resend
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'Lostify <onboarding@resend.dev>',
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

                            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 10px;">
                                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2e7d32;">AI Similarity Match: ${(similarityScore * 100).toFixed(2)}%</p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #888; font-size: 14px;">Please log in to the portal to view more details and coordinate the recovery.</p>
                                <a href="http://localhost:5173" style="display: inline-block; background: #000; color: #fff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Dashboard</a>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Resend Email Error:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Report submitted successfully. Owner notified via email.',
            report: newReport
        });


    } catch (err) {
        console.error('Discovery Submit Error:', err);
        res.json({ success: false, message: 'Server error while submitting discovery report' });
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
        res.json({ success: true, reports });
    } catch (err) {
        console.error('Error fetching reports for my items:', err);
        res.json({ success: false, message: 'Server error while fetching claims' });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.json({ success: false, message: 'Invalid status' });
        }

        const report = await DiscoveryReport.findById(id)
            .populate({
                path: 'lostItem',
                populate: { path: 'user', select: 'name email' }
            })
            .populate('reporter', 'name email');

        if (!report) {
            return res.json({ success: false, message: 'Report not found' });
        }

        // Verify that the user updating the status is the owner of the lost item
        if (report.lostItem.user._id.toString() !== req.user) {
            return res.json({ success: false, message: 'Not authorized to update this report' });
        }

        report.status = status;
        await report.save();

        // If accepted, mark the lost item as accepted
        if (status === 'accepted') {
            await LostItem.findByIdAndUpdate(report.lostItem._id, { status: 'accepted' });
        }

        // Send Email Notification to Reporter via Resend
        if (process.env.RESEND_API_KEY) {
            try {
                const ownerName = report.lostItem.user.name;
                const itemName = report.lostItem.itemName;

                console.log(`Attempting to send status update (${status}) to reporter:`, report.reporter.email);

                const { data, error } = await resend.emails.send({
                    from: 'Lostify <onboarding@resend.dev>',
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
                });

                if (error) {
                    console.error('Resend Error (Reporter Notification):', error);
                } else {
                    console.log('Email sent to reporter successfully:', data);
                }
            } catch (emailError) {
                console.error('Reporter Email Exception:', emailError);
            }
        } else {
            console.warn('RESEND_API_KEY missing, skipping reporter notification');
        }

        res.json({ success: true, message: `Report ${status} successfully. Reporter notified via email.`, report });
    } catch (err) {
        console.error('Error updating report status:', err);
        res.json({ success: false, message: 'Server error while updating status' });
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
        res.json({ success: true, reports });
    } catch (err) {
        console.error('Error fetching accepted reports:', err);
        res.json({ success: false, message: 'Server error while fetching accepted reports' });
    }
};
