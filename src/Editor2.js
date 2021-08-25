import ReactQuill from 'react-quill';
import { useEffect } from 'react';
import { db } from './firebase';
import firebase from 'firebase';

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

export default function Editor2({
  subCommentInput,
  subCommentChange,
  tags,
  subCommentJson,
  id,
  closeSubCommentEditor,
  setSubCommentInput,
  setSubCommentJson,
  setId
}) {
  function takeSubComment(id) {
    if (subCommentJson.hasOwnProperty('ops')) {
      let tagValues = [];

      subCommentJson.ops.map((object) => {
        if (typeof object.insert === 'object') {
          tagValues.push(object.insert.mention.value);
        }
      });

      const subComment = {
        body: subCommentInput,
        tags: tagValues,
        createdAt: new Date()
      };

      db.collection('posts')
        .doc(id)
        .update({
          subThreads: firebase.firestore.FieldValue.arrayUnion(subComment)
        });
    }
  }

  useEffect(() => {
    atValues = tags;
  }, [tags]);

  return (
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
        value={subCommentInput}
        placeholder="Write your comment here"
        onChange={subCommentChange}
      />

      <button
        onClick={() => {
          takeSubComment(id);
          setSubCommentInput('');
          setSubCommentJson({});
          closeSubCommentEditor(id);
          setId('');
        }}
      >
        Post
      </button>
    </div>
  );
}
