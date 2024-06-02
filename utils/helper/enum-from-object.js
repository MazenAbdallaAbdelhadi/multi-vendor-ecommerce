exports.enumFormObject = (obj) => {
  return Object.keys(obj).map((e) => obj[e]);
};
