const checkForSecrets = (code) => {
  const secretPatterns = [
    /api[_-]?key\s*=\s*['"][A-Za-z0-9]{20,}['"]/i,
    /-----BEGIN PRIVATE KEY-----/,
  ];
  return secretPatterns.some((pattern) => pattern.test(code));
};
