import ReactQuill from 'react-quill';
import { useEffect,useState } from 'react';
import firebase from 'firebase';
import { db } from './firebase';


let atValues = [];

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }],
    [('bold', 'italic', 'underline', 'strike', 'blockquote')],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'video'],
    ['code-block']
  ],
  mention: {
    allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
    mentionDenotationChars: ['@', '#'],
    source: function (searchTerm, renderItem, mentionChar) {
      let values;
      if (mentionChar === '@' || mentionChar === '#') {
        values = atValues;
      }
      if (searchTerm.length === 0) {
        renderItem(values, searchTerm);
      } else {
        const matches = [];
        for (let i = 0; i < values.length; i++)
          if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase()))
            matches.push(values[i]);

        renderItem(matches, searchTerm);
      }
    }
  }
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'video',
  'code-block',
  'mention'
];

export default function Editor({ tags }) {

  const [commentInput, setCommentInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState({});

  function onHandleSubmit(e) {
    e.preventDefault();

    let tagValues = [];

    jsonOutput.ops.map((object) => {
      if (typeof object.insert === 'object') {
        tagValues.push(object.insert.mention.value);
      }
    });

    db.collection('posts').add({
      body: commentInput,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      tag: tagValues,
      subThreads:[]
    });

    setCommentInput('');
    setJsonOutput({});
  }

  function handleChange(content, delta, source, editor) {
    setCommentInput(content);
    setJsonOutput(editor.getContents());
  }

  useEffect(() => {
    atValues = tags;
  }, [tags]);

  return (
    <div>
    <div style={{ height: '20vh' }}>
      <ReactQuill
        style={{
          width: '90%',
          height: '15vh',
          fontSize: '18px',
          margin: '10px'
        }}
        modules={modules}
        formats={formats}
        value={commentInput}
        placeholder="Write your comment here"
        onChange={handleChange}
      />
      
     
    </div>
     <button
     style={{
       margin: '10px',
     }}
     onClick={onHandleSubmit}
   >
     Post
   </button>
   </div>
  );
}
