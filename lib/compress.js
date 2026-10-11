const zlib = require("zlib");

const COMPRESSIBLE = /text|javascript|json|xml|svg/;

function compress(req, res, next) {
  const accept = req.headers["accept-encoding"] || "";
  if (req.method === "HEAD" || !/\bgzip\b/.test(accept)) {
    return next();
  }

  const chunks = [];
  const write = res.write.bind(res);
  const end = res.end.bind(res);

  res.write = function (chunk, encoding, callback) {
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = undefined;
    }
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }
    if (typeof callback === "function") callback();
    return true;
  };

  res.end = function (chunk, encoding, callback) {
    if (typeof chunk === "function") {
      callback = chunk;
      chunk = undefined;
      encoding = undefined;
    } else if (typeof encoding === "function") {
      callback = encoding;
      encoding = undefined;
    }
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }

    const body = Buffer.concat(chunks);
    const type = String(res.getHeader("Content-Type") || "");
    const skip = res.getHeader("Content-Encoding") || !COMPRESSIBLE.test(type) || body.length === 0;
    if (skip) {
      res.write = write;
      res.end = end;
      return end(body, callback);
    }

    zlib.gzip(body, (err, compressed) => {
      res.write = write;
      res.end = end;
      if (err || compressed.length >= body.length) {
        return end(body, callback);
      }
      const vary = res.getHeader("Vary");
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", vary ? `${vary}, Accept-Encoding` : "Accept-Encoding");
      res.removeHeader("Content-Length");
      return end(compressed, callback);
    });
  };

  next();
}

module.exports = compress;
