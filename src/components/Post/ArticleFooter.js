import React from "react";
import PropTypes from "prop-types";

const ArticleFooter = props => {
  const { prefix, theme } = props;

  return (
    <React.Fragment>
      <div className="content">
        <div>
          版权声明：自由转载-非商用-非衍生-保持署名（<a href="http://creativecommons.org/licenses/by-nc-nd/3.0/deed.zh">
            创意共享3.0许可证
          </a>）
        </div>
        <div>发布日期：{prefix}</div>
        <div className="location">
          <span className="name">本文地址：</span>
          {typeof window !== "undefined" ? (
            <a className="href" href={window.location.href}>
              {window.location.href}
            </a>
          ) : (
            ""
          )}
        </div>
      </div>

      {/* --- STYLES --- */}
      <style jsx>{`
        .content {
          margin: ${theme.space.l} 0;
          padding: ${theme.space.l} 0;
          border-top: 1px solid ${theme.line.color};
          border-bottom: 1px solid ${theme.line.color};
        }
        .location {
          overflow: hidden;
        }
        .name {
          float: left;
        }
        .href {
          max-width: calc(100% - 80px);
          float: left;
          text-overflow: hidden;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      `}</style>
    </React.Fragment>
  );
};

ArticleFooter.propTypes = {
  theme: PropTypes.object.isRequired,
  prefix: PropTypes.string.isRequired
};

export default ArticleFooter;
