#!/bin/sh
# Xcode Cloud, depoyu klonladiktan hemen sonra bu betigi calistirir.
#
# Bu bir Capacitor projesi: ios/App/App/public icindeki web varliklari depoda
# tutulmuyor, her derlemede uretiliyor. xcodebuild'den once web katmanini
# derleyip native projeye senkronlamak zorundayiz, yoksa uygulama bos acilir.
set -e

echo "--- Node kuruluyor"
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node --version
npm --version

echo "--- Bagimliliklar"
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci

echo "--- Web katmani derleniyor"
npm run build

echo "--- Native projeye senkron"
npx cap sync ios

echo "--- Okunus korpusu paketin icinde mi (1.0.8'in ana yeniligi)"
ls -la ios/App/App/public/assets/ | grep -i translit || {
  echo "HATA: okunus korpusu uretilmemis, derleme durduruluyor"
  exit 1
}

echo "--- Hazir"
