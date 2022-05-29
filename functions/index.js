const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
admin.initializeApp();

exports.createImage = functions.firestore
  .document("images/{imageId}")
  .onCreate((snap, context) => {
    const createdDoc = snap.data();
    const id = uuidv4();

    var entryObject = {
      id: id,
      uid: "todo",
      date: new Date(),
    };

    const imageRef = admin
      .firestore()
      .collection("images")
      .where("id", "==", createdDoc.id);

    const doc = imageRef.get().update({ entryId: id });

    console.log(doc);

    return admin
      .firestore()
      .doc("entries/" + id)
      .set(entryObject);
  });
