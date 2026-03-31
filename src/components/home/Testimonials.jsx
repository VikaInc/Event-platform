import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../../services/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FaTrash, FaEdit, FaChevronDown } from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import './Testimonials.css';

const Testimonials = () => {
  const [comments, setComments] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadComments(true);
  }, []);

  const loadComments = async (isInitial = false) => {
    try {
      const commentsRef = collection(db, 'comments');
      let q;
      
      if (isInitial) {
        q = query(commentsRef, orderBy('createdAt', 'desc'), limit(3));
      } else {
        q = query(commentsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(3));
      }
      
      const snapshot = await getDocs(q);
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (isInitial) {
        setComments(commentsData);
      } else {
        setComments(prev => [...prev, ...commentsData]);
      }
      
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 3);
      
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) return;

    const newCommentData = {
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0],
      eventTitle: 'Общий отзыв',
      text: newComment,
      createdAt: new Date()
    };

    const tempId = 'temp-' + Date.now();
    setComments([{ id: tempId, ...newCommentData }, ...comments]);
    setNewComment('');
    setShowForm(false);

    try {
      const docRef = await addDoc(collection(db, 'comments'), newCommentData);
      setComments(prev => prev.map(c => 
        c.id === tempId ? { ...c, id: docRef.id } : c
      ));
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return;

    const deletedComment = comments.find(c => c.id === commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));

    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setComments(prev => [...prev, deletedComment]);
    }
  };

  const handleEditComment = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = async (commentId) => {
    const originalText = comments.find(c => c.id === commentId)?.text;
    
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, text: editText } : c
    ));
    setEditingId(null);

    try {
      await updateDoc(doc(db, 'comments', commentId), {
        text: editText
      });
    } catch (error) {
      console.error('Ошибка редактирования:', error);
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, text: originalText } : c
      ));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'сегодня';
    if (diff === 1) return 'вчера';
    if (diff < 7) return `${diff} дня назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="testimonials">
      <div className="section-header">
        <h2>Комментарии</h2>
        <Link to="/comments" className="view-all">Все комментарии →</Link>
      </div>

      {user && !showForm && (
        <div className="add-comment-trigger" onClick={() => setShowForm(true)}>
          <div className="comment-avatar">
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div className="comment-input-placeholder">
            Написать комментарий...
          </div>
        </div>
      )}

      {user && showForm && (
        <div className="add-comment-form">
          <div className="comment-avatar">
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div className="comment-form-content">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              className="comment-textarea"
              rows="3"
              autoFocus
            />
            
            <div className="form-actions">
              <button onClick={() => setShowForm(false)} className="cancel-btn">
                Отмена
              </button>
              <button 
                onClick={handleAddComment}
                className="submit-btn"
                disabled={!newComment.trim()}
              >
                Оставить комментарий
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-avatar-small">
              {comment.userName?.charAt(0) || 'Г'}
            </div>
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-author">{comment.userName || 'Гость'}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              
              {editingId === comment.id ? (
                <div className="edit-form">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-textarea"
                    rows="3"
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleSaveEdit(comment.id)} className="save-edit-btn">
                      Сохранить
                    </button>
                    <button onClick={() => setEditingId(null)} className="cancel-edit-btn">
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-text">{comment.text}</p>
                  {user?.uid === comment.userId && (
                    <div className="comment-actions">
                      <button onClick={() => handleEditComment(comment)} className="action-btn">
                        <FaEdit /> Редактировать
                      </button>
                      <button onClick={() => handleDeleteComment(comment.id)} className="action-btn delete">
                        <FaTrash /> Удалить
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button onClick={() => loadComments(false)} className="load-more-comments-btn">
            <FaChevronDown /> Показать еще комментарии
          </button>
        </div>
      )}

      {comments.length === 0 && (
        <div className="no-comments">
          {user ? 'Будьте первым, кто оставит комментарий' : 'Комментариев пока нет'}
        </div>
      )}
    </div>
  );
};

export default Testimonials;