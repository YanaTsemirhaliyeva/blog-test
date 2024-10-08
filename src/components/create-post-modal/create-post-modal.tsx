
import styles from './create-post-modal.module.scss';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { useScrollLock } from '../hook/use-scroll-lock';
import { usePostItem } from '../../store/post-item';
import BtnTransparent from '../btn-transparent/btn-transparent';
import { PostUpdateData } from '../../types/post';
import toast from 'react-hot-toast';
import { AppRoute } from '../../const';
import { useNavigate } from 'react-router-dom';



export function CreatePost() {
  const { isModalActive, setIsModalActive, setCreateData, createData, createPost } = usePostItem();
  const modalRef = useRef(null);
  const { lockScroll, unlockScroll } = useScrollLock();
  const initialData = { title: '', body: '' };
  const [data, setData] = useState<PostUpdateData>(initialData);
  const [isChange, setIsChange] = useState<boolean>(false);
  const navigate = useNavigate();

  const disabled = data.body === '' || data.title === '';

  useEffect(() => {
    setCreateData(data)
  }, [data])

  const handleChangeForm = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    const { name, value } = evt.target;
    setData({ ...data, [name]: value });
    if (!isChange) {
      setIsChange(true);
    }
  };

  const handleButtonClose = () => {
    setIsModalActive(false);
  };

  const handleEscapeKeydown = useCallback((evt: KeyboardEvent) => {
    if (evt.key === 'Escape') {
      setIsModalActive(false);
    }
  }, [isModalActive]);

  useEffect(() => {
    if (isModalActive && modalRef.current) {
      document.addEventListener('keydown', handleEscapeKeydown);
      lockScroll();
    }

    return () => {
      unlockScroll();
      document.removeEventListener('keydown', handleEscapeKeydown);
    };
  }, [isModalActive, handleEscapeKeydown, lockScroll, unlockScroll]);


  const handlePostCreate = async () => {
    if (createData) {
      const response = await createPost(
        {title: createData.title, body: createData.body, userId: 1}
      );
      if (response) {
        toast.success('Successfully created');
        navigate(AppRoute.Blog);
        setIsModalActive(false);
      }
      if (!response) {
        toast.error('Something went wrong, please try again');
      }
    }
  }


  return (
    <FocusLock returnFocus disabled={!isModalActive}>
      <div
        ref={modalRef}
        className={isModalActive ? `${styles.modal} ${styles['modal--active']}` : styles.modal}
        onClick={handleButtonClose}
      >
        <div
          className={styles['modal__desktop']}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles['modal__wrapper']}>
            <div className={styles['modal__content']}>
              <form className={styles['modal__form']}>
                <div className={styles['modal__field']}>
                  <label>
                    <div className={styles['modal__title-wrapper']}>
                      <span className={styles['modal__title']}>Title</span>
                      <button
                        className={styles.btn}
                        onClick={handleButtonClose}
                        type='button'
                      >
                      </button>
                    </div>

                    <textarea
                      placeholder="Title"
                      maxLength={100}
                      name='title'
                      onChange={handleChangeForm}
                      value={data.title}
                    />
                  </label>
                </div>
                <div className={`${styles['modal__field']} ${styles['modal__field--desc']}`}>
                  <label>
                    <span className={styles['modal__title']}>Description</span>
                    <textarea
                      placeholder="Description text"
                      maxLength={400}
                      name='body'
                      onChange={handleChangeForm}
                      value={data.body}
                    />
                  </label>
                </div>
                <div className={styles['modal__btn']}>
                  <BtnTransparent
                    text='Create'
                    disabled={disabled}
                    onClick={handlePostCreate}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </FocusLock>
  );
}
