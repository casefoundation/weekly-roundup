const dateFormat = require('dateformat');

exports.formatRoundup = function (baseUrl, roundup, signature) {
  let content = '';
  if (roundup && roundup.articleGroups) {
    roundup.articleGroups.forEach(ag => {
      // Only show article groups with articles
      const color = process.env.HEADLINE_COLOR || '#007bff';
      if (ag.articles && ag.articles.length > 0) {
        content += '<div style="color:#343a40;"><br/>';
        content += `<div style="text-align:center; color:#6c757d; font-size: 36px; font-weight: bold; margin: 20px;">${ag.name}</div>`;
        ag.articles.forEach(a => {
          const source = `<div style="font-weight: bold; font-size: 16px; margin: 0 12px;">${a.source}</div>`;
          const title = ` <div style="color:${color}; font-size: 24px; font-weight: bold; margin: 0 12px;">${a.title}</div>`;
          let published = '';
          if (a.published !== null) {
            try {
              published = `<div style="font-weight: bold; color:#6c757d; font-size: 16px; margin: 0 12px;">${dateFormat(new Date(a.published), 'mm/dd/yyyy')}</div>`;    
            } catch (err) {}
          }
          const summary = `<div style="font-size: 16px; margin: 6px 12px 12px 12px;">${a.summary}</div>`;
          content += 
            `<div>
              <a href="${a.url}" style="text-decoration: none;">${title}</a>
              ${source}
              ${published}
              ${summary}
            </div>
            <br />`;
        });
        content += '</div><hr/>';
      }
    });
  }
  let preface = '';
  if (roundup.preface) {
    preface = `<div style="font-size: 16px; margin: 12px;">${roundup.preface}</div>`;
  }
  return `
    <div style="width: 100%; text-align: center">
      <img height="80" src="${process.env.LOGO_URL}" />
    </div>
    ${preface}
    <div>
      ${content}
    </div>
    <div style="font-size: 16px; margin: 12px;">
      ${signature ? signature.split('\n').join('<br/>') : ''}
    </div>
  `;
};
