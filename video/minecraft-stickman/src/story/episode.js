// Which episode is being rendered: ?ep=2 in the browser, EP=2 in Node. Defaults to episode 1.
export const EP = (typeof location !== 'undefined' && new URLSearchParams(location.search).get('ep')) || (typeof process !== 'undefined' && process.env && process.env.EP) || '1';
