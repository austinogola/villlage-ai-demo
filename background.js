chrome.runtime.onMessage.addListener(async(request,sender,sendResponse)=>{
    if(request.profText){
        const {profText,queryText,questionText,type}=request
        let answer=await getAnswer(profText,queryText,questionText,type)
    }
    if(request.getProfile){
        let profileData=await getUserData(request.profile_id)
        let profileObject=JSON.stringify(profileData)
        let scraped=await chrome.storage.local.get('scrapedProfiles')
        let scrapedProfiles=scraped.scrapedProfiles
        if(scrapedProfiles.length>2){
            scrapedProfiles.pop()
        }
        scrapedProfiles.unshift(profileData)
        chrome.storage.local.set({scrapedProfiles:scrapedProfiles})
       
    }
    

})
chrome.runtime.onConnect.addListener(port=>{
    if(port.name=='AI answ'){
        port.onMessage.addListener(async(msg)=>{
            const {profText,queryText,questionText,type}=msg
            let answer=await getAnswer(profText,queryText,questionText,type)
            port.postMessage(answer)
        })
    }
    
})

chrome.storage.local.set({scrapedProfiles:[]})



const getAnswer=(profile,queryType,question,type)=>{
    return new Promise(async(resolve,reject)=>{

        

        if(type=='single'){
            let body={
                profile:JSON.parse(profile),
                queryType,
                question
            }
            let res=await fetch('http://18.156.78.6:5000/query/single',{
                method:'POST',
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(body)
            })

            let response=await res.json()
            resolve(response)
        }
        else{
            let body={
                profiles:profile,
                queryType,
                question
            }
        
            let res=await fetch('http://18.156.78.6:5000/query/multi',{
                method:'POST',
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(body)
            })
            let response=await res.json()
            resolve(response)
        }

        
    })
}

function getContactInfoFromAPI2(profile_id) {
    return new Promise((resolve, reject) => {
      var contact_info_obj = {};
      getCsrfToken().then((csrf_token) => {
        fetch(`https://www.linkedin.com/voyager/api/identity/profiles/${profile_id}/profileContactInfo`,{
            method:'GET',
            headers: { "csrf-token": csrf_token, accept: "*" },
            withCredentials: true,

        })
          .then(async(data) => {

            let info=await data.json()
  
            resolve(info);
          })
          .catch(() => {
            resolve(contact_info_obj);
          });
      });
    });
  }
  

  function getProfileUserDetailsFromAPI(profile_id) {
    return new Promise((resolve, reject) => {
      var profileViewObj = {};
      getCsrfToken().then((csrf_token) => {
        fetch(`https://www.linkedin.com/voyager/api/identity/profiles/${profile_id}/profileView`,{
            method:'GET',
            headers: { "csrf-token": csrf_token, accept: "*" },
            withCredentials: true,

        })
        .then(async data=>{
            let fin=await data.json()
            resolve(fin)
        })
      });
    });
  }
  
  const logDaa=async()=>{
    let contactInfo2=await getContactInfoFromAPI2('me')
    console.log('contact info2',contactInfo2);
    
    let robProfile=await getProfileUserDetailsFromAPI("rob-simpson-96a36823")
    console.log(robProfile);
  }
  

  const getUserData=async (profile_id)=>{
    let userDetails=await getProfileUserDetailsFromAPI(profile_id)

    let detailsObj={}

    const {certificationView,courseView,educationView,honorView,volunteerExperienceView,
        languageView,organizationView,positionView,profile,skillView}=userDetails
    
    //Profile
    detailsObj.Person=profile.firstName +" "+ profile.lastName
    detailsObj.Headline=profile.headline
    
    //EdUcation
    let Education=''
    if(educationView.elements && educationView.elements[0]){
        educationView.elements.forEach(async(element,index)=>{
            let timePeriod=element.timePeriod
            let startDate='undefined'
            let endDate='undefined'
            if(timePeriod){
                startDate=timePeriod.startDate?timePeriod.startDate.year:'undefined'
                endDate=timePeriod.endDate?timePeriod.endDate.year:'present'
            }
            let education =`${index+1}.${element.schoolName} - ${element.degreeName},${element.fieldOfStudy} (${startDate}-${endDate})\n`
            Education+=education
        })
    }
    detailsObj.Education=Education

    //Experience
    let Experience=''
    if(positionView.elements && positionView.elements[0]){
        positionView.elements.forEach(async(element,index)=>{
            let timePeriod=element.timePeriod
            let startDate='undefined'
            let endDate='undefined'
            if(timePeriod){
                startDate=timePeriod.startDate?timePeriod.startDate.year:'undefined'
                endDate=timePeriod.endDate?timePeriod.endDate.year:'present'
            }
            let position =`${index+1}.${element.title} at ${element.companyName},${element.locationName} (${startDate}-${endDate})\n`
            Experience+=position
        })
    }
    detailsObj['Work-Experience']=Experience

    //Certifications
    let Certifications=''
    if(certificationView.elements && certificationView.elements[0]){
        certificationView.elements.forEach((element,index)=>{
            let timePeriod=element.timePeriod
            let startDate='undefined'
            if(timePeriod){
                startDate=timePeriod.startDate?timePeriod.startDate.year:'undefined'
            }
            let cert =`${index+1}.${element.name} - ${element.authority}(${startDate})\n`
            Certifications+=cert
        })
    }
    detailsObj['Licenses and Cerfifications']=Certifications


    //Skills
    let Skills=''
    if(skillView.elements && skillView.elements[0]){
        skillView.elements.forEach((element,index)=>{
            let position =`${index+1}.${element.name}\n`
            Skills+=position
        })
    }
    detailsObj['Skills']=Skills

     //Volunteering
     let Volunteering=''
     if(volunteerExperienceView.elements && volunteerExperienceView.elements[0]){
         volunteerExperienceView.elements.forEach(async(element,index)=>{
            let timePeriod=element.timePeriod
            let startDate='undefined'
            if(timePeriod){
                startDate=timePeriod.startDate?timePeriod.startDate.year:'undefined'
            }
             let position =`${index+1}.${element.role}- ${element.companyName} (${startDate})\n`
             Volunteering+=position
         })
     }
     detailsObj['Volunteering']=Volunteering



    return (detailsObj)
    
  }

  function getCsrfToken() {
    return new Promise((resolve, reject) => {
      chrome.cookies.get(
        {
          url: "https://www.linkedin.com",
          name: "JSESSIONID",
        },
        function done(data) {
          let xt = data || {};
          resolve(xt.value.replace(/"/g, ""));
        }
      );
    });
  }