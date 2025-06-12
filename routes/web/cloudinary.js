const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/sign', express.json(), async (req, res) => {
    try {
        console.log(req.body);
        const paramsToSign = req.body.paramsToSign;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
        res.send(signature);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to generate signature');
    }
})

module.exports = router;
