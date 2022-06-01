const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.createImage = functions.firestore
  .document("images/{imageId}")
  .onCreate((snap, context) => {
    const createdDoc = snap.data();

    // Create entry item
    var entryObject = {
      id: createdDoc.entryId,
      uid: createdDoc.uid,
      date: new Date(),
    };

    return admin
      .firestore()
      .doc("entries/" + createdDoc.entryId)
      .set(entryObject);
  });
