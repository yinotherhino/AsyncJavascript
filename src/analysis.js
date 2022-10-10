const { getTrips, getVehicle, getDriver } = require('api');

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
const analysis= (async ()=> {
  // Your code goes here
  let [result,totalAmount,noOfCashTrips,cashBilledTotal, drivers,amountsEarned, noOfDriversWithMoreThanOneVehicle, driversObj]= [{},0,0,0, [], {}, 0, []];
  let data= await(getTrips());
  data.forEach((x,i)=>{
    amount= Number(data[i].billedAmount.toString().replaceAll(',',''));
    totalAmount+= amount;
    if(x.isCash=== true){
      noOfCashTrips++;
      cashBilledTotal+= amount;
    }
    drivers.push(x.driverID);
    if(amountsEarned[x.driverID]) amountsEarned[x.driverID] += amount;
    else amountsEarned[x.driverID]= amount;
  })
  let eachDriver= [...new Set(drivers)];
  let arrayOfGetDriverX= eachDriver.map(x=> getDriver(x))
  const driversPromise = await Promise.allSettled(arrayOfGetDriverX)
  driversPromise.forEach(x=> { if(x.status== 'fulfilled'){driversObj.push(x.value)}});
  for (let j=0;j<driversObj.length; j++){
    if(driversObj[j]['vehicleID'].length>1) noOfDriversWithMoreThanOneVehicle++;
  }
  result= {noOfCashTrips: noOfCashTrips, noOfNonCashTrips:data.length-noOfCashTrips, billedTotal:Number(totalAmount.toFixed(2)),cashBilledTotal:Number(cashBilledTotal.toFixed(2)),
          noOfDriversWithMoreThanOneVehicle:noOfDriversWithMoreThanOneVehicle,nonCashBilledTotal:totalAmount.toFixed(2)- Number(cashBilledTotal.toFixed(2))}
  let mostTripsDriver= getMostTripsDriverId(drivers);
  result['mostTripsByDriver']= getDriverDetails(await(getDriver(mostTripsDriver.driverId)), mostTripsDriver.driverId,mostTripsDriver.noOfTrips, amountsEarned);
  highestEarner= getHighestEarningDriver(amountsEarned);
  let tripsObj= getTripsObj(drivers);
  result['highestEarningDriver']= getDriverDetails(await(getDriver(highestEarner.driverId)), highestEarner.driverId, tripsObj[highestEarner.driverId], 0)
  result['highestEarningDriver'].totalAmountEarned= highestEarner.amount;
  return result;
})()

const getHighestEarningDriver=  (amountsEarned)=>{
  let highestEarnerId;
  let highestAmount=0
  Object.keys(amountsEarned).forEach(x=>{
    if (amountsEarned[x] > highestAmount){
      highestEarnerId= x;
      highestAmount= amountsEarned[x];
    }})
  return {driverId:highestEarnerId, amount:highestAmount}
  };
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
  const getDriverDetails= (driverObj, driverId, noOfTrips, amountsEarned)=> ({name: driverObj.name, email: driverObj.email, phone:driverObj.phone, noOfTrips:noOfTrips, totalAmountEarned: amountsEarned[driverId]});

module.exports = analysis;
