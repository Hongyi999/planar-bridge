const cloud = require('wx-server-sdk');
cloud.init({ env: 'dev-7gpmka26fbecea2a' });

exports.main = async (event) => {
  const { fileID } = event;

  if (!fileID) {
    return { text: '', error: '未提供音频文件' };
  }

  try {
    // Get temporary URL for the uploaded audio
    const urlRes = await cloud.getTempFileURL({ fileList: [fileID] });
    const audioUrl = urlRes.fileList[0].tempFileURL;

    // Use Hunyuan model to transcribe speech to text
    const ai = cloud.extend.AI;
    const result = await ai.createModel('hunyuan-turbo').generateText({
      messages: [{
        role: 'user',
        content: '请将以下音频链接中的语音转写为文字。如果是关于卡牌游戏 Flesh and Blood 的搜索词，请直接返回搜索关键词，不要加任何额外解释。音频链接：' + audioUrl
      }]
    });

    const text = (result.text || result.content || '').trim();
    return { text: text };
  } catch (err) {
    console.error('Voice to text error:', err);

    // Fallback: try WeChat OCR-style speech recognition if available
    try {
      // Download the audio file
      const fileRes = await cloud.downloadFile({ fileID: fileID });
      const buffer = fileRes.fileContent;

      // Try using the built-in ASR if available
      const asrRes = await cloud.openapi.customerServiceMessage.uploadTempMedia({
        type: 'voice',
        media: {
          contentType: 'audio/mp3',
          value: buffer
        }
      });
      // This is a fallback attempt - may not work for STT directly
      return { text: '', error: '语音识别暂不可用，请使用文字搜索' };
    } catch (fallbackErr) {
      console.error('Fallback STT error:', fallbackErr);
      return { text: '', error: '语音识别失败: ' + err.message };
    }
  }
};
