const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Instagram = require("instagram-web-api");
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

exports.postToInstagram = functions.firestore
  .document("images/{imageId}")
  .onCreate(async (snap, context) => {
    const createdDoc = snap.data();
    const date = new Date();
    var FIVE_MIN = 5 * 60 * 1000;
    const postDate = new Date();
    postDate.setHours(16, 20, 0);
    const diff = Math.abs(date - new Date(postDate));
    console.log(diff);

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
