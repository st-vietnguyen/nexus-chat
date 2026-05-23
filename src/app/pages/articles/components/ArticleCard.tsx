import React from 'react';
import { NavLink } from 'react-router-dom';

import likeIcon from '@assets/icons/ic-like.svg';
import dislikeIcon from '@assets/icons/ic-dislike.svg';
import eyeIcon from '@assets/icons/ic-eye.svg';

export const ArticleCard = ({ post }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">
          <NavLink className="card-link" to={post?.id.toString()}>
            {post?.title}
          </NavLink>
        </h5>
        <p className="card-text">{post?.body}</p>
        <div className="card-footer">
          <ul className="card-meta">
            <li className="card-meta-item">
              <img className="card-meta-icon" src={likeIcon} alt="like-icon" />{' '}
              <span>{post?.reactions?.likes}</span>
            </li>
            <li className="card-meta-item">
              <img
                className="card-meta-icon"
                src={dislikeIcon}
                alt="dislike-icon"
              />
              <span>{post?.reactions?.dislikes}</span>
            </li>
            <li className="card-meta-item">
              <img className="card-meta-icon" src={eyeIcon} alt="eye-icon" />
              <span>{post?.views}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
