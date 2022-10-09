const { getTrips, getDriver, getVehicle } = require('api');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */


const driverReport= (async()=> {
  // Your code goes here
  let data= await(getTrips());
  let driverObjbyTrips= addTripsDetails(data);
  let [arrayOfDriverId, arrayOfVehicleId, vehicleDetails]=[[], [], {}]
  for(x of data){
    if(!arrayOfDriverId.includes(x.driverID)) arrayOfDriverId.push(x.driverID)
  }
  for (x of arrayOfDriverId){
    try {
      let driverDetails= await(getDriver(x));
      driverObjbyTrips[x].fullName= driverDetails.name;
      driverObjbyTrips[x].phone= driverDetails.phone;
      // let vehicle= await(getVehicle(...driverDetails.vehicleID));
      driverObjbyTrips[x].vehicles= [...driverDetails.vehicleID];
      
      // driverObjbyTrips[x].vehicles=(await(getVehicle(...driverDetails.vehicleID)))
      // arrayOfVehicleId.push([x,...driverDetails.vehicleID]);
      // console.log(vehicle)
    } catch (error) {
      continue;
    }
    Promise.all(await(getDriver(...arrayOfDriverId))).then((values) => {
      console.log(values);
    });
    // driverObjbyTrips[x].vehicles= driverObjbyTrips[x].vehicles.map((y,j)=>{
    //   return await(getVehicle(y))
    // });
  }

  // for (x of arrayOfVehicleId){
  //   try {
  //     let vehicle= await(getVehicle(x));
  //     vehicleDetails[x]= {'plate':vehicle.plate, 'manufacturer':vehicle.manufacturer, }
  //   } catch (error) {
  //     continue;
  //   }
  // }
  
  // console.log(driverObjbyTrips['3539a692-69b6-4b24-89fc-f8b505a1eecd']);
  // let result=[addDriverDetails(data, driverObjbyTrips)];
  // console.log(arrayOfVehicleId)
  
  // console.log(driverObjbyTrips['6abbc78e-87d8-4def-a722-bd19b70e9639']);
})()


//fullname   phone     vehicles

const addTripsDetails= (data)=>{
  let driverObjbyTrips={};
  for (x of data){
    let billed= Number(Number(x.billedAmount.toString().replaceAll(',','')).toFixed(2));
    let tripsObj={'user': x.user.name, 'created':x.created, 'pickup':x.pickup.address, 'destination':x.destination.address, 'billed':billed, 'isCash':x.isCash}
    if(driverObjbyTrips[x.driverID]){
      driverObjbyTrips[x.driverID]['noOfTrips']+=1;
      driverObjbyTrips[x.driverID]['noOfCashTrips']+= x.isCash? 1: 0;
      driverObjbyTrips[x.driverID]['noOfNonCashTrips']+= !x.isCash? 1: 0;
      driverObjbyTrips[x.driverID]['trips'].push(tripsObj)
      driverObjbyTrips[x.driverID]['totalAmountEarned']+= Number(billed.toFixed(2));
      driverObjbyTrips[x.driverID]['totalCashAmount']+= x.isCash? Number(billed.toFixed(2)) : 0;
      driverObjbyTrips[x.driverID]['totalNonCashAmount']+= !x.isCash? Number(billed.toFixed(2)) : 0;
    }
    else{
      driverObjbyTrips[x.driverID]={};
      driverObjbyTrips[x.driverID]['id']= x.driverID;
      driverObjbyTrips[x.driverID]['noOfTrips']=1;
      driverObjbyTrips[x.driverID]['noOfCashTrips']= x.isCash? 1: 0;
      driverObjbyTrips[x.driverID]['noOfNonCashTrips']= !x.isCash? 1: 0;
      driverObjbyTrips[x.driverID]['trips']=[tripsObj];
      driverObjbyTrips[x.driverID]['totalAmountEarned']= billed;
      driverObjbyTrips[x.driverID]['totalCashAmount']= x.isCash? billed : 0;
      driverObjbyTrips[x.driverID]['totalNonCashAmount']= !x.isCash? billed : 0;
    } 
  }
  return driverObjbyTrips;
}
module.exports = driverReport;
