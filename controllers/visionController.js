const httpStatus = require('../utils/httpStatus');
const { analyzeFoodImage } = require('../services/openaiVisionService');

const analyze = async (req, res) => {
  const { imageDataUrl, detail } = req.body || {};
  const { result, rawText } = await analyzeFoodImage({ imageDataUrl, detail });

  res.status(httpStatus.OK).json({
    ok: true,
    result,
    rawText,
  });
};

module.exports = {
  analyze,
};
