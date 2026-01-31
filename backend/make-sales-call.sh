#!/bin/bash

# Script to trigger an outbound sales call
# Usage: ./make-sales-call.sh +1234567890

if [ -z "$1" ]; then
    echo "Usage: $0 <phone-number>"
    echo "Example: $0 +1234567890"
    exit 1
fi

PHONE_NUMBER=$1

echo "📞 Initiating sales call to $PHONE_NUMBER..."
echo ""

curl -X POST http://localhost:3000/api/make-call \
  -H "Content-Type: application/json" \
  -d "{\"to\": \"$PHONE_NUMBER\"}" \
  | jq '.'

echo ""
echo "✅ Call initiated! You should receive a call shortly with the sales pitch."
