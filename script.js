import 'dotenv/config';
import {
  initiateDeveloperControlledWalletsClient,
  generateEntitySecretCiphertext
} from "@circle-fin/developer-controlled-wallets";

/**
 * Circle Developer Controlled Wallets — Entity Secret Ciphertext Generator
 * Uses official Circle SDK generateEntitySecretCiphertext helper
 * Built for ArcPulse Ecosystem by ProManas
 */

const apiKey = process.env.CIRCLE_API_KEY || "TEST_API_KEY:bbea6fab16e1195e62e7110a253159d8:18a4019d73e030dde1061aa509d5ccfd";
const entitySecret = process.env.CIRCLE_ENTITY_SECRET || "204c43bfde66206f2e510a398f5725e6e5c7f215ae4ffab072d3da455b2980a5";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: apiKey,
  entitySecret: entitySecret
});

// Fallback helper method on client instance
if (client && !client.getEntitySecretCiphertext) {
  client.getEntitySecretCiphertext = async function () {
    const ciphertext = await generateEntitySecretCiphertext({
      apiKey: this.params?.apiKey || apiKey,
      entitySecret: this.params?.entitySecret || entitySecret,
    });
    return {
      data: {
        entitySecretCiphertext: ciphertext,
      },
    };
  };
}

async function main() {
  console.log("🚀 Fetching Entity Secret Ciphertext via Circle SDK...");
  try {
    const response = await client.getEntitySecretCiphertext();
    console.log("🔒 Entity Secret Ciphertext:");
    console.log(response.data.entitySecretCiphertext);
    return response.data.entitySecretCiphertext;
  } catch (error) {
    console.error("❌ Error generating ciphertext:", error.message || error);
  }
}

main();
