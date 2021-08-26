/* eslint-disable */

import { db } from './firebase';
import { useEffect, useState } from 'react';
import firebase from 'firebase';
import './styles.css';

import Editor from './Editor';
import Editor2 from './Editor2';

import renderHTML from 'react-render-html';
import ReactDOM from 'react-dom';

import 'react-quill/dist/quill.snow.css';

import 'quill-mention';
import 'quill-mention/dist/quill.mention.css';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const [editorStatus, setEditorStatus] = useState(false);


  function addTags() {
    db.collection('tags')
      .doc('tag')
      .update({
        myTags: firebase.firestore.FieldValue.arrayUnion(tagInput)
      });

    setTagInput('');
  }

  function tagFilter(tag) {
    db.collection('posts')
      .where('tag', 'array-contains', tag)
      .onSnapshot((querySnapshot) => {
        setPosts(querySnapshot.docs.map((post) => post));
      });
  }

  function showAllComments() {
    db.collection('posts')
      .orderBy('createdAt')
      .onSnapshot((querySnapshot) => {
        setPosts(querySnapshot.docs.map((post) => post));
      });
  }

  function addEditor(id) {
    ReactDOM.render(
      <Editor2
        key={id} 
        tags={tags}
        id={id}
        closeSubCommentEditor={closeSubCommentEditor}
        setEditorStatus={setEditorStatus}
      />,
      document.getElementById(id)
    );
  }

  function closeSubCommentEditor(id) {
    ReactDOM.render(<span></span>, document.getElementById(id));
  }

  useEffect(() => {
    showAllComments();

    db.collection('tags')
      .doc('tag')
      .onSnapshot((doc) => {
        if(doc.exists){
          setTags(doc.data().myTags);
        }
      });
  }, []);

  return (
    <div>
      <input
        onChange={(e) => {
          setTagInput({ value: e.target.value });
        }}
      />
      <button onClick={addTags}>Create new tag</button>

      <Editor
        tags={tags}
      />

      <div
        style={{
          margin: '15px'
        }}
      >
        <p style={{ display: 'inline' }}>tags: </p>
        <button onClick={showAllComments}>All</button>
        {tags.map((tag) => {
          return (
            <button
              onClick={() => {
                tagFilter(tag.value);
              }}
            >
              {tag.value}
            </button>
          );
        })}
      </div>

      {posts.map((post) => {
        return (
          <div
            style={{
              borderTop: 'solid 1px black'
            }}
          >
            <div>{renderHTML(post.data().body)}</div>
            <button
              style={{
                display: 'block'
              }}
              onClick={() => {
                setEditorStatus(!editorStatus);
                if (editorStatus) {
                  closeSubCommentEditor(post.id);
                } else {
                  addEditor(post.id);
                }
              }}
            >
              Reply
            </button>
            <div id={post.id} />

            <div style={{ marginLeft: '30px' }}>
              {post.data().hasOwnProperty('subThreads')
                ? post.data().subThreads.map((subComment) => {
                    return <p>{renderHTML(subComment.body)}</p>;
                  })
                : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
