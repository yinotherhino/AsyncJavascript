const { getTrips, getDriver, getVehicle } = require('api');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
const driverReport= async()=> {
  // Your code goes here
  let data= await(getTrips());
  let result= addTripsDetails(data);
  let [arrayOfDriverId, arrayOfVehicleId,  arrayOfDriverDetails]=[[], [], []]
  for(let x of data){
    if(!arrayOfDriverId.includes(x.driverID)) arrayOfDriverId.push(x.driverID);
  }
  let arrayOfGetDrivers= arrayOfDriverId.map(x=> getDriver(x));
  const gotDrivers = await Promise.allSettled(arrayOfGetDrivers);
  const driversDetailsObj= createMap(arrayOfDriverId, gotDrivers);
  arrayOfDriverDetails.forEach(x=> arrayOfVehicleId.push(...x.vehicleID));
  for (let x of Object.keys(driversDetailsObj)){arrayOfVehicleId.push(...driversDetailsObj[x].vehicleID)}
  let arrayOfGetVehicles= arrayOfVehicleId.map(x=> getVehicle(x));
  const gotVehicles = await Promise.allSettled(arrayOfGetVehicles);
  for (let i=0; i<arrayOfVehicleId.length; i++){
    if (gotVehicles[i].status== 'rejected'){
      gotVehicles=gotVehicles.slice(0,i).concat(gotVehicles(i+1));
      arrayOfVehicleId=arrayOfVehicleId.slice(0,i).concat(arrayOfVehicleId(i+1));}}
  const neededVehicleDetails= extractVehicle(gotVehicles)
  const vehicleDetailsObj= createMap(arrayOfVehicleId, neededVehicleDetails);
  result= addDriverDetails(result, driversDetailsObj, vehicleDetailsObj);
  return result;
}


const addDriverDetails= (result, driversDetailsObj, vehicleDetailsObj)=>{
  Object.keys(driversDetailsObj).forEach((x,i)=>{
    driversDetailsObj[x].vehicleID.forEach((y,j)=>{
      driversDetailsObj[x].vehicleID[j]= vehicleDetailsObj[driversDetailsObj[x].vehicleID[j]]
    })
    result[x].fullName= driversDetailsObj[x].name;
    result[x].phone= driversDetailsObj[x].phone;
    result[x].vehicles=  driversDetailsObj[x].vehicleID;
    result[x].noOfVehicles=  driversDetailsObj[x].vehicleID.length;
  })
  return result;
}
const createMap= (keyObj, valueObj)=>{
  let mapObj= {};
  for(let i=0; i<keyObj.length; i++){
    if(valueObj[i].status== 'fulfilled'){
    mapObj[keyObj[i]]= valueObj[i].value;}
    else if(!valueObj[i].status){
      mapObj[keyObj[i]]= valueObj[i];
    }}
  return mapObj
}


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
const extractVehicle= (gotVehicles)=>{
  let result=[];
  gotVehicles.forEach(x=> {result.push({manufacturer:x.value.manufacturer, plate: x.value.plate})})
  return result;
}
module.exports = driverReport;
