import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Test() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p className="mt-2 text-slate-600">
        This is a test page for development purposes.
      </p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        onClick={testFirestoreWrite}
      >
        Test UP
      </button>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        onClick={testReadMedia}
      >
        Test DOWN
      </button>
    </div>
  );
}

async function testFirestoreWrite() {
  // build a plain JS object
  // call addDoc(...)
  // log the new doc id

  const testObj = {
    contentType: "image/png",
    createdAt: new Date(),
    createdByRole: "admin",
    filename: "test.jpg",
    height: 1080,
    s3Key: "test.jpg",
    tagIds: [],
    tagSlugs: [],
    title: "Test Image",
    updatedAt: new Date(),
    updatedByRole: "admin",
    url: "https://example.com/test.jpg",
    width: 1920
  };

  await addDoc(collection(db, "media"), testObj);

  console.log("Test document added to Firestore");
}

async function testReadMedia() {
  // get all docs from media
  // map them
  // console.log(mappedDocs)

  try {
    // const images = await getAllMedia();
    console.log(images);
  } catch (e) {
    console.error(e);
    return;
  }
}
