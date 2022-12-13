/*
All the logic related to getting stuff from Ixxels
*/
const axios = require("axios");

const baseUrl =
  "https://rdv-afs.ixelles.be/qmaticwebbooking/rest/schedule/branches/";
const branch =
  "2a94f84c6d99376986e4fc91342dad52dd69ec2b1fffb14fef79a1c50738e3db";

function constructURL(branch, servicePublicId, customSlotLength) {
  return `${baseUrl}${branch}/dates;servicePublicId=${servicePublicId};customSlotLength=${customSlotLength}`;
}

function getABCUrl() {
  /// Demande d'obtention d'un titre de séjour (A, B, C, D, EU, EU+,, F, F+, H, , I, J, K, L, M)
  const servicePublicId =
    "21b59b2bbbbdc01547bb693e0b815f5e49fd14d96734bbc79331422f285f7ad9";
  const customSlotLength = "10";
  return constructURL(branch, servicePublicId, customSlotLength);
}

function getPremierUrl() {
  /// Première inscription d'un citoyen non membre de l'UE
  const servicePublicId =
    "8562bfb3c40332a888ceca9d7e8f2922b911f7e17dbf25268b3b5ea706b79d71";
  const customSlotLength = "15";
  return constructURL(branch, servicePublicId, customSlotLength);
}

async function getNextDate(url) {
  try {
    const response = await axios.get(url);
    console.log(response);
    const nextDate = response.data[0].date;
    console.log(nextDate);
    return nextDate;
  } catch (error) {
    console.error(error);
  }
}
