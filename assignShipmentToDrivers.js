const fs = require('fs');

//Calulating the base suitability score (baseSS)
function calculateSuitability(shipment, driver) 
{
  const shipmentLength = shipment.length;
  const driverLength = driver.length;
  let baseSS = 0;


  //When the shipment's destination street name is even then multiplty the numbers of vowels from drivers name to 1.5 for baseSS
  //Otherwise (when it is odd) multiplty number of consonants in the driver’s name by 1 for for baseSS
  if (shipmentLength % 2 === 0)
  {
    const vowels = String(driver).match(/[aeiou]/gi);
    baseSS = vowels ? vowels.length * 1.5 : 0;
  } 
  else 
  {
    const consonants = String(driver).match(/[bcdfghjklmnpqrstvwxyz]/gi)
    baseSS = consonants ? consonants.length : 0;
  }

  //Checking if the shipment's destination street name shares any common factors by using gcd. 
  //If gcd is not equal to 1 then multiply by 1.5;
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  if (gcd(shipmentLength, driverLength) !== 1) 
  {;
    return baseSS * 1.5;
  } 
  else 
  {
    return baseSS;
  }

}

//Assiging shipments to drivers while calulating the total suitability score (SS)
function assignShipmentsToDrivers(shipments, drivers) 
{
  const shipmentCount = shipments.length;
  const driverCount = drivers.length;
  const shipmentAssignedToDriver = Array(shipmentCount).fill(false); //Keeps track if the shipment has been assigned to a driver
  const driverAssignedToShipment = Array(driverCount).fill(false); //Keeps track of whether a driver has been assigned to a shipment.
  const shipmentDriverMap = new Map(); //Creating a new map where store the shipments to the driver
  let totalSuitability = 0;

  //Looping though shipmentDriverMap until all shipments are assigned to drivers
  while (shipmentDriverMap.size < shipmentCount) 
  {
    let maxSuitability = 0; //To keep track of the maximum suitability score found during each lop
    let maxShipmentIndex, maxDriverIndex; //To make sure that each driver is paired with an address with the highest SS

    //Goes through each address and checks that if it is already been assigned to a driver. 
    for (let shipmentIndex = 0; shipmentIndex < shipmentCount; shipmentIndex++) 
    {
      if (shipmentAssignedToDriver[shipmentIndex]) 
      {
          continue;
      }

      //Goes though each driver and checks if it is already been assigned a shipment.
      for (let driverIndex = 0; driverIndex < driverCount; driverIndex++) 
      {
        if (driverAssignedToShipment[driverIndex]) continue;

        //Calulates the SS score of the current shipment and driver 
        const driverName = drivers[driverIndex].toLowerCase(); // Convert driver name to lowercase
        const shipmentAddress = shipments[shipmentIndex].toLowerCase(); // Convert shipment address to lowercase
        const suitability = calculateSuitability(shipmentAddress, driverName);

        //Checks to see if the current suityability score is greater than the maximum suitability score
        //If yes, then it will update the score and update the values of each assigned driver and shipment
        if (suitability > maxSuitability) 
        {
          maxSuitability = suitability;
          maxShipmentIndex = shipmentIndex;
          maxDriverIndex = driverIndex;
        }
      }
    }

    totalSuitability += maxSuitability;
    //Makes sure that each conbination of shipment and driver are not considered during the next iterations
    shipmentAssignedToDriver[maxShipmentIndex] = true;
    driverAssignedToShipment[maxDriverIndex] = true;
    shipmentDriverMap.set(shipments[maxShipmentIndex], drivers[maxDriverIndex]);
  }

  return {
    totalSuitability,
    shipmentDriverMap,
  };
}

//Reads the shipments.txt and drivers.txt files
function readInputFiles(shipmentFile, driverFile)
 {
    const shipments = fs.readFileSync(shipmentFile, 'utf-8').trim().split('\n');
    const drivers = fs.readFileSync(driverFile, 'utf-8').trim().split('\n');

    return {
      shipments,
      drivers,
    };
  }

function main() 
{
   const shipmentFile = process.argv[2];
   const driverFile = process.argv[3];

  if (!shipmentFile || !driverFile)
  {
    console.log('Please provide both shipment and driver input files.');
    return;
  }

  const { shipments, drivers } = readInputFiles(shipmentFile, driverFile);
  const { totalSuitability, shipmentDriverMap } = assignShipmentsToDrivers(shipments, drivers);
  
  console.log('Total Suitability:', totalSuitability);
  console.log('Shipment -> Driver Assignments:');
  shipmentDriverMap.forEach((driver, shipment) => 
  {
    console.log(`${shipment} -> ${driver}`);
  });

}

main();