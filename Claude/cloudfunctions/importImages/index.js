var cloud = require('wx-server-sdk');
var got = require('got');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();
var _ = db.command;

/**
 * Download image from URL and upload to WeChat cloud storage
 * Returns the cloud fileID
 */
async function downloadAndUpload(imageUrl, cloudPath) {
  // Download the image
  var response = await got(imageUrl, {
    responseType: 'buffer',
    timeout: { request: 15000 },
    retry: { limit: 2 }
  });

  // Upload to cloud storage
  var result = await cloud.uploadFile({
    cloudPath: cloudPath,
    fileContent: response.body
  });

  return result.fileID;
}

/**
 * Get file extension from URL
 */
function getExtension(url) {
  if (!url) return '.png';
  var match = url.match(/\.(\w+)(?:\?|$)/);
  return match ? '.' + match[1] : '.png';
}

/**
 * Main cloud function entry
 *
 * Actions:
 *   'processDefault' - Download default (first) image for cards that don't have cloudImageId
 *                      Parameters: offset (default 0), limit (default 5)
 *
 *   'processPrintings' - Download all printing images for a specific card
 *                        Parameters: cardId (required)
 *
 *   'stats' - Return counts of cards with/without cloud images
 */
exports.main = async function(event) {
  var action = event.action || 'stats';

  if (action === 'stats') {
    // Count cards with and without cloud images
    var totalResult = await db.collection('cards').count();
    var withImageResult = await db.collection('cards')
      .where({ cloudImageId: _.neq('') })
      .count();
    return {
      success: true,
      total: totalResult.total,
      withCloudImage: withImageResult.total,
      withoutCloudImage: totalResult.total - withImageResult.total
    };
  }

  if (action === 'processDefault') {
    var offset = event.offset || 0;
    var limit = event.limit || 5;

    // Find cards that have imageUrl but no cloudImageId
    var result = await db.collection('cards')
      .where({
        imageUrl: _.neq(''),
        cloudImageId: _.eq('')
      })
      .skip(offset)
      .limit(limit)
      .field({ _id: true, name: true, imageUrl: true, setCode: true })
      .get();

    var cards = result.data;
    if (cards.length === 0) {
      return { success: true, processed: 0, message: 'No more cards to process' };
    }

    var processed = 0;
    var errors = [];

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      try {
        var ext = getExtension(card.imageUrl);
        var cloudPath = 'cards/' + (card.setCode || 'unknown') + '/' + card._id + ext;
        var fileID = await downloadAndUpload(card.imageUrl, cloudPath);

        // Update the card record with cloud image ID
        await db.collection('cards').doc(card._id).update({
          data: {
            cloudImageId: fileID,
            updatedAt: new Date()
          }
        });
        processed++;
        console.log('Processed: ' + card.name + ' -> ' + fileID);
      } catch (e) {
        errors.push(card._id + ': ' + e.message);
        console.error('Error processing ' + card.name + ': ' + e.message);
      }
    }

    return {
      success: true,
      processed: processed,
      batchSize: cards.length,
      errors: errors
    };
  }

  if (action === 'processPrintings') {
    var cardId = event.cardId;
    if (!cardId) {
      return { success: false, error: 'cardId is required' };
    }

    var cardResult = await db.collection('cards').doc(cardId).get();
    var card = cardResult.data;
    if (!card) {
      return { success: false, error: 'Card not found: ' + cardId };
    }

    var printings = card.printings || [];
    var processed = 0;
    var errors = [];

    for (var i = 0; i < printings.length; i++) {
      var printing = printings[i];
      if (!printing.imageUrl || printing.cloudImageId) continue;

      try {
        var ext = getExtension(printing.imageUrl);
        var cloudPath = 'cards/' + (printing.setId || 'unknown') + '/' + printing.uniqueId + ext;
        var fileID = await downloadAndUpload(printing.imageUrl, cloudPath);

        // Update the specific printing's cloudImageId
        var updateKey = 'printings.' + i + '.cloudImageId';
        var updateData = {};
        updateData[updateKey] = fileID;
        updateData.updatedAt = new Date();

        await db.collection('cards').doc(cardId).update({ data: updateData });
        processed++;
        console.log('Processed printing: ' + printing.id + ' -> ' + fileID);
      } catch (e) {
        errors.push(printing.id + ': ' + e.message);
        console.error('Error processing printing ' + printing.id + ': ' + e.message);
      }
    }

    return {
      success: true,
      cardId: cardId,
      processed: processed,
      totalPrintings: printings.length,
      errors: errors
    };
  }

  return { success: false, error: 'Unknown action: ' + action };
};
