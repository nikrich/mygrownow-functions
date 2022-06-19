const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Instagram = require("instagram-web-api");
const dateDiff = require("./utils/date");
admin.initializeApp();

exports.createImage = functions.firestore
  .document("images/{imageId}")
  .onCreate(async (snap, context) => {
    const createdDoc = snap.data();

    // Create entry item
    var entryObject = {
      id: createdDoc.entryId,
      uid: createdDoc.uid,
      date: createdDoc.date,
      imageUrl: createdDoc.url,
      growId: createdDoc.growId
    };

    // get grow item
    const growRef = admin.firestore().collection('grows').doc(`${createdDoc.growId}`);
    const growSnapshot = await growRef.get();

    // if exists - calculate day of growth
    if (growSnapshot.exists) {     
      const dayDiff = Math.abs(dateDiff.dayDiff(growSnapshot.data().startedOn.toDate(), createdDoc.date.toDate()));
      entryObject["day"] = dayDiff;
    }

    const entryRef = admin.firestore().collection('entries').doc(`${createdDoc.entryId}`);
    const entrySnapshot = await entryRef.get();

    // make sure entry is only created once
    if (entrySnapshot.exists) {
      return;
    }

    return admin
      .firestore()
      .doc("entries/" + createdDoc.entryId)
      .set(entryObject);
  });

exports.postToInstagram = functions.firestore
  .document("images/{imageId}")
  .onCreate(async (snap, context) => {
    const createdDoc = snap.data();
    const date = new Date();
    var FIVE_MIN = 5 * 60 * 1000;
    const postDate = new Date();
    postDate.setHours(14, 50, 0);
    const diff = Math.abs(date - new Date(postDate));
    console.log(`date: ${postDate}`);
    console.log(diff / 60 / 1000);

    if (diff > FIVE_MIN) {
      console.log("Not posting now - but will do at 4:20");
      return;
    }

    const client = new Instagram({
      username: "mygrownow",
      password: "jX2%6Xs4^*9484UR",
    });

    try {
      await client.login();
    } catch (ex) {
      console.log("nothing to see here, move along");
    }

    const { media } = await client.uploadPhoto({
      photo: createdDoc.url,
      caption: `Grow Update - ${date.toDateString()} #weed #marijuana #homegrown #indoor #closetgrow`,
      post: "feed",
    });

    console.log(`https://www.instagram.com/p/${media.code}/`);
  });
