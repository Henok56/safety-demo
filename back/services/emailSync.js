const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');
const FdmEvent = require('../models/fdm.model');

const AUTHORIZED_SENDERS = ['henokgs@ethiopianairlines.com'];

// --- Helper: Archiving ---
const autoArchiveFile = (filename) => {
    try {
        const sourcePath = path.join(__dirname, '../uploads', filename);
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = now.toLocaleString('default', { month: 'long' });
        const archiveDir = path.join(__dirname, '../Archive', year, month);
        
        if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
        
        const destinationPath = path.join(archiveDir, filename);
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destinationPath);
            return true;
        }
    } catch (err) { 
        console.error("❌ Archive Error:", err); 
    }
    return false;
};

// --- Core Logic: Processing the Email ---
const processEmail = async (mail) => {
    try {
        const sender = mail.from.value[0].address.toLowerCase();
        const subject = mail.subject || "";
        
        if (!AUTHORIZED_SENDERS.includes(sender)) {
            console.warn(`✈️ Ignored: Unauthorized sender ${sender}`);
            return;
        }

        const tagMatch = subject.match(/\[FDM(.*?)\]/i);
        if (!tagMatch) {
            console.warn(`✈️ Ignored: No [FDM] tag found in subject "${subject}"`);
            return;
        }
        
        const fullTag = tagMatch[0].toUpperCase(); // Normalize tag [FDM-XXXX]
        console.log(`📩 Syncing Data for Tag: ${fullTag}`);

        const attachmentData = [];
        if (mail.attachments) {
            for (let att of mail.attachments) {
                const cleanName = att.filename.replace(/\s+/g, '_');
                const taggedFilename = `${Date.now()}-${cleanName}`;
                const savePath = path.join(__dirname, '../uploads', taggedFilename);
                
                fs.writeFileSync(savePath, att.content);
                autoArchiveFile(taggedFilename);
                
                attachmentData.push({ 
                    fileName: att.filename, 
                    filePath: taggedFilename, 
                    size: att.size 
                });
            }
        }

        const updateResult = await FdmEvent.findOneAndUpdate(
            { syncTag: fullTag }, 
            { 
                $set: { status: 'AUTO-SYNCED' },
                $setOnInsert: { 
                    eventName: subject, 
                    occurrenceDate: mail.date || new Date(),
                    fleetType: 'TBD',
                    tailNumber: 'TBD'
                },
                $push: { 
                    discussionHistory: { 
                        subject, 
                        body: mail.text || "No text content", 
                        sender, 
                        date: mail.date || new Date() 
                    },
                    ...(attachmentData.length > 0 && { attachments: { $each: attachmentData } })
                }
            },
            { upsert: true, new: true }
        );
        
        console.log(`✅ Success! DB Updated for ${fullTag}`);
    } catch (error) { 
        console.error("❌ Process Error:", error); 
    }
};

// --- IMAP Configuration ---
const imap = new Imap({
    user: 'HenokGs@ethiopianairlines.com',
    password: process.env.EMAIL_PASSWORD,
    host: 'outlook.office365.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    keepalive: { interval: 10000 }
});

// Function to fetch and process specific messages
const fetchAndProcess = (results) => {
    const f = imap.fetch(results, { bodies: '', markSeen: true });
    f.on('message', (msg) => {
        msg.on('body', (stream) => {
            simpleParser(stream, async (err, parsed) => {
                if (!err) await processEmail(parsed);
            });
        });
    });
};

imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
        if (err) throw err;
        console.log("🚀 IMAP CONNECTED: Watching Ethiopian Airlines Inbox...");

        // 1. Initial Scan for any missed emails while server was offline
        imap.search(['UNSEEN', ['SUBJECT', '[FDM]']], (err, results) => {
            if (!err && results.length > 0) {
                console.log(`Found ${results.length} unread FDM emails. Processing...`);
                fetchAndProcess(results);
            }
        });

        // 2. Listen for live incoming mail
        imap.on('mail', () => {
            imap.search(['UNSEEN', ['SUBJECT', '[FDM]']], (err, results) => {
                if (!err && results.length > 0) fetchAndProcess(results);
            });
        });
    });
});

imap.on('error', (err) => {
    console.error('IMAP Connection Error:', err);
});

imap.on('end', () => {
    console.log('IMAP Connection lost. Reconnecting in 5s...');
    setTimeout(() => imap.connect(), 000);
});

imap.connect();

module.exports = imap;