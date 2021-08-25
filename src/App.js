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

  const [commentInput, setCommentInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState({});

  const [subCommentInput, setSubCommentInput] = useState('');
  const [subCommentJson, setSubCommentJson] = useState({});
  const [editorStatus, setEditorStatus] = useState(false);
  const [id, setId] = useState('');

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
      tag: tagValues
    });

    setCommentInput('');
    setJsonOutput({});
  }

  function handleChange(content, delta, source, editor) {
    setCommentInput(content);
    setJsonOutput(editor.getContents());
  }

  function subCommentChange(content, delta, source, editor) {
    setSubCommentInput(content);
    setSubCommentJson(editor.getContents());
  }

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
        subCommentInput={subCommentInput}
        subCommentChange={subCommentChange}
        tags={tags}
        id={id}
        closeSubCommentEditor={closeSubCommentEditor}
        setSubCommentInput={setCommentInput}
        setSubCommentJson={setSubCommentJson}
        setId={setId}
      />,
      document.getElementById(id)
    );
  }

  function closeSubCommentEditor(id) {
    ReactDOM.render(<p></p>, document.getElementById(id));
  }

  useEffect(() => {
    showAllComments();

    db.collection('tags')
      .doc('tag')
      .onSnapshot((doc) => {
        setTags(doc.data().myTags);
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
        commentInput={commentInput}
        handleChange={handleChange}
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

      <button
        style={{
          margin: '10px'
        }}
        onClick={onHandleSubmit}
      >
        Post
      </button>

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
                setId(post.id);
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
