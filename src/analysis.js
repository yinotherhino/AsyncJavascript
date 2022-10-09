const { getTrips, getVehicle, getDriver } = require('api');

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
const analysis= async ()=> {
  // Your code goes here
  let [result,totalAmount,noOfCashTrips,cashBilledTotal, drivers, amountsEarned, noOfDriversWithMoreThanOneVehicle]= [{},0,0,0, [], {}, 0];
  let data= await(getTrips());
  data.forEach((x,i)=>{
    amount= Number(data[i].billedAmount.toString().replaceAll(',',''));
    totalAmount+= amount;
    if(data[i].isCash=== true){
      noOfCashTrips++;
      cashBilledTotal+= amount;
    }
    drivers.push(x.driverID);
    if(amountsEarned[x.driverID]) amountsEarned[x.driverID] += amount;
    else amountsEarned[x.driverID]= amount;
  })
  let eachDriver= [...new Set(drivers)];
  for(x of eachDriver){
    try {
      let DriverDetails= await(getDriver(x));
      if(DriverDetails.vehicleID.length>1) noOfDriversWithMoreThanOneVehicle++
    } catch (error) {
      continue
    }};
  result= {noOfCashTrips: noOfCashTrips, noOfNonCashTrips:data.length-noOfCashTrips, billedTotal:totalAmount.toFixed(2),cashBilledTotal:cashBilledTotal.toFixed(2),
          noOfDriversWithMoreThanOneVehicle:noOfDriversWithMoreThanOneVehicle,nonCashBilledTotal:totalAmount- cashBilledTotal.toFixed(2)}
  let mostTripsDriver= getMostTripsDriverId(drivers);
  result['mostTripsByDriver']= getDriverDetails(await(getDriver(mostTripsDriver.driverId)), mostTripsDriver.driverId,mostTripsDriver.noOfTrips, amountsEarned);
  highestEarner= getHighestEarningDriver(amountsEarned);
  let tripsObj= getTripsObj(drivers);
  result['highestEarningDriver']= getDriverDetails(await(getDriver(highestEarner.driverId)), highestEarner.driverId, tripsObj[highestEarner.driverId], 0)
  result['highestEarningDriver'].totalEarned= highestEarner.amount;
  return result
}
const getHighestEarningDriver=  (amountsEarned)=>{
  let highestEarnerId;
  let highestAmount=0
  Object.keys(amountsEarned).forEach(x=>{
    if (amountsEarned[x] > highestAmount){
      highestEarnerId= x;
      highestAmount= amountsEarned[x];
    }})
  return {driverId:highestEarnerId, amount:highestAmount}};
  const getTripsObj= (drivers)=>{
    let tripsObj= {};
    drivers.forEach((x)=> {
      if (tripsObj[x]) tripsObj[x]++
      else tripsObj[x]=1;
    })
    return tripsObj
  }
  const getMostTripsDriverId= (drivers)=>{
    let tripsCount=getTripsObj(drivers)
    return {driverId:Object.keys(tripsCount).sort((a,b)=> tripsCount[b]-tripsCount[a])[0], noOfTrips:tripsCount[Object.keys(tripsCount).sort((a,b)=> tripsCount[b]-tripsCount[a])[0]]};
  }
  const getDriverDetails= (driverObj, driverId, noOfTrips, amountsEarned)=> ({name: driverObj.name, email: driverObj.email, phone:driverObj.phone, noOfTrips:noOfTrips, totalEarned: amountsEarned[driverId]});

module.exports = analysis;
