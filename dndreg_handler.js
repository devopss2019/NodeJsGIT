const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction, InternalError } = require('sawtooth-sdk/processor/exceptions')
const cbor = require('cbor')
const crypto = require('crypto')

var logger = require('./logger').Logger;

const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase()
  
const TP_FAMILY = 'dndreg-js'
const TP_NAMESPACE = _hash(TP_FAMILY).substring(0, 6)
const TP_VERSION = '1.0'

	// Constants defined in wallet specification
	/*
	 * const MIN_VALUE = 0 const MAX_VALUE = 25000 const MAX_NAME_LENGTH = 20
	 */
		
	const _decodeCbor = (buffer) =>
	  new Promise((resolve, reject) =>
	    cbor.decodeFirst(buffer, (err, obj) => (err ? reject(err) : resolve(obj)))
	  )

	const _toInternalError = (err) => {
	  let message = (err.message) ? err.message : err
	  throw new InternalError(message)
	}

	const _setEntry = (context, address, stateValue) => {
	  logger.info("Set Entry called with value "+stateValue);
	  let entries = {
	    [address]: cbor.encode(stateValue)
	  }
	var ret1=entries 
	var  ret2=context.setState(entries)
	return ret2;
	}
	
	const _dndRegistration= (context, address, mobilenumber, serviceprovider,servicearea,preference,status,activationdate,optedservices) => (possibleAddressValues) => {
		console.log('\n Customer DND Registration Status')
		console.log('--------------------------------\n')
		  let stateValueRep = possibleAddressValues[address]
		let existingservices
		let existingdate
		  let stateValue
		  let flag 
		  if (stateValueRep && stateValueRep.length > 0) {
		    stateValue = cbor.decodeFirstSync(stateValueRep)
		    let stateName = stateValue[mobilenumber]
		    
		    if (stateName) {
		    	 existingservices = stateValue[mobilenumber].optedservices
		    	 existingdate = stateValue[mobilenumber].activationdate
		    	
		   	  let mblnumber = stateValue[mobilenumber].mobilenumber
		  	let currentdate = new Date(activationdate);
		    	let storeddate = new Date(existingdate);
		    	if(mblnumber===mobilenumber &&  existingservices ==0)
		    		{
		    			console.log('Your Phone number already in Fully blocked registration preference you cannot opt any partially blocked services now ')
		    			flag=true;
					    	/*
							 * throw new InvalidTransaction( `For FBR number you
							 * are not allowed to opt any partial services` )
							 */
		    			
		    		}
		    	 /* else if(!((currentdate.getFullYear()===storeddate.getFullYear()) && (currentdate.getMonth()===storeddate.getMonth()) && (currentdate.getDate()-storeddate.getDate())>=4))
		    		{
		    			console.log(' You will be allowed to register for any new services only after 7 days from activation date :'+storeddate)
		    			flag=true;
		    		}*/
		    	//else if((existingservices.includes(optedservices) ||existingservices===optedservices ))
		    	else if(optedservices.split('').every(val => existingservices.split('').includes(val)))
		    	{
		    		console.log('Dear Customer Your request is placed on '+existingdate+' for updating your prefernce is already in progress , you will be able to place your next request only after the current request has been processed by 1 Day.')
		    		/*throw new InvalidTransaction(
		        `Request is already in Progress`
		      )*/flag=true;
		    	}
		    	else
		    		{
		    		optedservices = existingservices+','+optedservices
		    		}
		      
		    }
		  }
		
		if(!flag)
			{
				
			
		  // 'set' passes checks so store it in the state
		  if (!stateValue) {
		    stateValue = {}
		  }
			  
		  function DNDRegistration(mobilenumber,serviceprovider,servicearea,preference,status,activationdate,optedservices){
			  this.mobilenumber=mobilenumber
			  this.serviceprovider=serviceprovider
			  this.servicearea=servicearea
			  this.preference=preference
			  this.status=status
			  this.activationdate=activationdate
			  this.optedservices=optedservices
		  }

		 var dndinfo	= new DNDRegistration(mobilenumber,serviceprovider,servicearea,preference,status,activationdate,optedservices)
		  stateValue[mobilenumber] =dndinfo
		console.log('Dear Customer we have taken your request to Update DND preferences for '+dndinfo.serviceprovider+' Number '+dndinfo.mobilenumber+'\n')
		console.log("Phone Number       :: "+dndinfo.mobilenumber)
		console.log("Status             :: "+dndinfo.status)
		console.log("Activation Date is :: "+dndinfo.activationdate)
		console.log("Service Area       :: "+dndinfo.servicearea)
		console.log("Service Provider   :: "+dndinfo.serviceprovider)
		
		if (optedservices.length>=1) {
		optedServices = 2+ optedservices.replace(/,/g, "")
                var optedService2 = require('./optedService');
               opt = optedService2.getService(optedServices);
        console.log("Your Preference    ::",opt+'\n');
		}
		 
			}
		
		  return _setEntry(context, address, stateValue)
		}

		
	const _dndSearch= (context, address, mobilenumber) => (possibleAddressValues) => {
		console.log('\n Customer DND Search Status')
		console.log('--------------------------------\n')
		  let stateValueRep = possibleAddressValues[address]

		  let stateValue
		  if (stateValueRep && stateValueRep.length > 0) {
		    stateValue = cbor.decodeFirstSync(stateValueRep)
		    let stateName = stateValue[mobilenumber]
		    if (!stateName) {
		      throw new InvalidTransaction(
		        `Mobile number is not found in registry`
		      )
		    }
		  }
		  else{
			  throw new InvalidTransaction(
				        `Mobile number is not registered for DND so far`
					  
				)
		  }
		  // 'set' passes checks so store it in the state
		  if (!stateValue) {
		    stateValue = {}
		  }else{
		    console.log("Phone Number       :: "+stateValue[mobilenumber].mobilenumber)
			console.log("Status             :: "+stateValue[mobilenumber].status)
			console.log("Activation Date is :: "+stateValue[mobilenumber].activationdate)
			console.log("Service Area       :: "+stateValue[mobilenumber].servicearea)
			console.log("Service Provider   :: "+stateValue[mobilenumber].serviceprovider)
			console.log("Your Preference is :: "+stateValue[mobilenumber].preference)
			
			 if ((stateValue[mobilenumber].optedservices).length>=1) {
			let	optedServices = 2+ (stateValue[mobilenumber].optedservices).replace(/,/g, "")
		                var optedService2 = require('./optedService');
		                opt = optedService2.getService(optedServices);
		    console.log("Opted Services are ::",opt+'\n');

				}
		  }
		 
		  return  stateValue[mobilenumber]
		}	
	

    const _dndDeregistration= /*
								 * (context, address,
								 * mobilenumber,optedservices)
								 */(context, address, mobilenumber, serviceprovider,servicearea,preference,status,activationdate,optedservices) => (possibleAddressValues) => {
 
	      console.log('\n Customer DND De-registration Status')
		  console.log('--------------------------------\n')
          let stateValueRep = possibleAddressValues[address]
          let stateValue
          let existingdate
          let existingservices
          let updateoptservices
          let flag
          if (stateValueRep && stateValueRep.length > 0) {
            stateValue = cbor.decodeFirstSync(stateValueRep)
            let stateName = stateValue[mobilenumber]
            
               if (stateName) {
		    	existingservices = stateValue[mobilenumber].optedservices
		    	existingdate = stateValue[mobilenumber].activationdate
		    	let currentdate = new Date(activationdate);
		    	let storeddate = new Date(existingdate);
		    
		    	 if(existingservices==0 && existingservices!=optedservices)
		    		{
		    			console.log('you are not allowed to deregester the services that you entered , because your phone number is under FBR')
		    			flag=true;
		    		}
		    	/* else if(!((currentdate.getFullYear()===storeddate.getFullYear()) && (currentdate.getMonth()===storeddate.getMonth()) && (currentdate.getDate()-storeddate.getDate())>=90))
	    		{
	    			console.log(' You will be allowed to register any service only after 90 days from activation date :'+storeddate)
	    			flag=true;
	    		}*/

		    	//else if(!((existingservices.includes(optedservices)) ||(existingservices===optedservices)) )
		    	 else if(!(optedservices.split('').every(val => existingservices.split('').includes(val))))
		    	{
		    		console.log('Dear Customer, we are unable to process your request as it does not match your current subscription')
		    		throw new InvalidTransaction(
		        `Your are trying to stop the unsubscribed DND preference`
		      )
		    	}
		    	else
		    		{
		    		updateoptservices = existingservices.replace(optedservices,'')
		    		}
		      
		    }
            
            
          }
	      if(!flag){
          // 'set' passes checks so store it in the state
          if (!stateValue) {
            stateValue = {}
          }
          else{
        	  	stateValue[mobilenumber].status="De-active"
			  	stateValue[mobilenumber].optedservices=updateoptservices
			  	console.log('Dear Customer we have taken your request to Update DND preferences for '+stateValue[mobilenumber].serviceprovider+' Number '+stateValue[mobilenumber].mobilenumber+'\n')
			    console.log("Phone Number       :: "+stateValue[mobilenumber].mobilenumber)
				console.log("Status             :: "+stateValue[mobilenumber].status)
				console.log("De-Activation Date :: "+stateValue[mobilenumber].activationdate)
				console.log("Service Area       :: "+stateValue[mobilenumber].servicearea)
				console.log("Service Provider   :: "+stateValue[mobilenumber].serviceprovider)
				console.log("Your Preference is :: "+stateValue[mobilenumber].preference)
				// console.log("Opted Services are ::
				// "+stateValue[mobilenumber].optedservices+'\n')
				 if ((stateValue[mobilenumber].optedservices).length>=1) {
			let	optedServices = 2+ (stateValue[mobilenumber].optedservices).replace(/,/g, "")
		                var optedService2 = require('./optedService');
		                opt = optedService2.getService(optedServices);
		        console.log("Opted Services are ::",opt+'\n');

				}
          }
	      }
          return _setEntry(context, address, stateValue)
        }

	class DndregHandler extends TransactionHandler {
	
	  constructor() {
	    super(TP_FAMILY, [TP_VERSION], [TP_NAMESPACE])
	  }

	  apply(transactionProcessRequest, context) {
	    return _decodeCbor(transactionProcessRequest.payload)
	    
	      .catch(_toInternalError)
	       	  .then((update) => {
		    	let mobilenumber = update.Mobilenumber
			    if (!mobilenumber) {
			          throw new InvalidTransaction('Mobile Number  is required')
			    }
		       
		        let serviceprovider = update.Serviceprovider
			
		        let servicearea = update.Servicearea
			
		        let preference = update.Preference
			
		        let status = update.Status
		        
		        let optedservices = update.Optedservices
		
		        let activationdate = update.Activationdate
		       
		      	let	preferenceFn
		        if (preference === 'Full (No call and SMS)'){ 
		        	preferenceFn = _dndRegistration
		        	
		        } 
		        
		        else if (preference==='Partial') {
		        	preferenceFn = _dndRegistration
		        	
		        }
		        
		        else if (preference === 'ViewStatus') {
		        	preferenceFn = _dndSearch
		        
		        } 
		        
		        else if (preference === 'De-register') {
		        	preferenceFn = _dndDeregistration
		        } 
		        else {
		        	console.log('No action is Selected ')
		        }
		        let address = TP_NAMESPACE + _hash(mobilenumber).slice(-64)
		        
		        // Get the current state, for the key's address:
		        let getPromise = context.getState([address])

		        // Apply the action to the promise's result:
		        let actionPromise = getPromise.then(
		        		preferenceFn(context, address, mobilenumber, serviceprovider,servicearea,preference,status,activationdate,optedservices)
		        ) 

		        // Validate that the action promise results in the correctly set
				// address:
		        return actionPromise.then(addresses => {
		          if (addresses.length === 0) {
		            throw new InternalError('State error!')
		          }
		        })
	      })
	  }
	}

	module.exports = DndregHandler
