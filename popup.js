let singleForm=document.querySelector("form#Single")
let multiForm=document.querySelector("form#Multi")
let profile=document.querySelector("#profile")
let profile2=document.querySelector("#profile2")
let profile1=document.querySelector("#profile1")
let question=document.querySelector("#question")
let queryType=document.querySelector("#queryType")

let question2=document.querySelector("#question2")
let queryType2=document.querySelector("#queryType2")

let answer=document.querySelector("#answer")
let answer2=document.querySelector("#answer2")

let tabSpans=document.querySelectorAll('.tabs span')
let tabContents=document.querySelectorAll('.tabContent')

if(localStorage.getItem('village_profile')){
    profile.value=localStorage.getItem('village_profile')
}
if(localStorage.getItem('village_queryType')){
    queryType.value=localStorage.getItem('village_queryType')
}
if(localStorage.getItem('village_question')){
    question.value=localStorage.getItem('village_question')
}
if(localStorage.getItem('village_answer')){
    answer.value=localStorage.getItem('village_answer')
}


if(localStorage.getItem('village_profile1')){
    profile1.value=localStorage.getItem('village_profile1')
}
if(localStorage.getItem('village_profile2')){
    profile2.value=localStorage.getItem('village_profile2')
}
if(localStorage.getItem('village_queryType2')){
    queryType2.value=localStorage.getItem('village_queryType2')
}
if(localStorage.getItem('village_question2')){
    question2.value=localStorage.getItem('village_question2')
}
if(localStorage.getItem('village_answer2')){
    answer2.value=localStorage.getItem('village_answer2')
}

profile.addEventListener('change',e=>{
    localStorage.setItem('village_profile',e.target.value)
})
queryType.addEventListener('change',e=>{
    localStorage.setItem('village_queryType',e.target.value)
})
question.addEventListener('change',e=>{
    localStorage.setItem('village_question',e.target.value)
})
answer.addEventListener('change',e=>{
    localStorage.setItem('village_answer',e.target.value)
})


profile1.addEventListener('change',e=>{
    localStorage.setItem('village_profile1',e.target.value)
})
profile2.addEventListener('change',e=>{
    localStorage.setItem('village_profile2',e.target.value)
})
queryType2.addEventListener('change',e=>{
    localStorage.setItem('village_queryType2',e.target.value)
})
question2.addEventListener('change',e=>{
    localStorage.setItem('village_question2',e.target.value)
})
answer2.addEventListener('change',e=>{
    localStorage.setItem('village_answer2',e.target.value)
})

tabSpans.forEach(item=>{
    if(localStorage.getItem('active_Tab')){
        if(item.innerText==localStorage.getItem('active_Tab')){
            item.classList.add('active')
            tabContents.forEach(item2=>{
                item2.classList.remove('active')
                if(item2.id==item.innerText){
                    item2.classList.add('active')
                }
            })
            
        }
        else{
            item.classList.remove('active')
        }
    }
    
    item.addEventListener('click',e=>{
        localStorage.setItem('active_Tab',item.innerText)
        tabSpans.forEach(item=>{
            item.classList.remove('active')
        })
        e.target.classList.add('active')
        tabContents.forEach(item2=>{
            item2.classList.remove('active')
            if(item2.id==e.target.innerText){
                item2.classList.add('active')
            }
        })
    })
})

singleForm.addEventListener('submit',e=>{
    e.preventDefault()
    let profText=document.querySelector('#profile').value
    let queryText=document.querySelector('#queryType').value
    let questionText=document.querySelector('#question').value

    if((!queryText || queryText.length<1) && (!questionText || questionText.length<1)){
        document.querySelectorAll('.errorLog').forEach(item=>{
            item.style.display='block'
        })
        question.style.border='1px solid red'
        queryType.style.border='1px solid red'
    }
    else{
        document.querySelectorAll('.errorLog').forEach(item=>{
            item.style.display='none'
            question.style.border='1px solid black'
            queryType.style.border='1px solid black'
        })
        answer.setAttribute('placeholder','fetching...')
        var port = chrome.runtime.connect({
            name: "AI answ"
        });

        port.postMessage({profText,queryText,questionText,type:'single'})
        port.onMessage.addListener(function(msg) {
            answer.value=msg.answer?msg.answer:msg.message
            // port.disconnect()
        });
    }
})

chrome.storage.onChanged.addListener(async(changes,str)=>{
    
    if(changes.scrapedProfiles){
        let scrapedProfiles=changes.scrapedProfiles.newValue
        addScraped(scrapedProfiles)
    }

})

const addScraped=async(arr)=>{
    let scrapeDivs=document.querySelectorAll('.allScrapped>div')
    let scrapeArr=[]
    if(arr){
        scrapeArr=[...arr]
    }
    else{
        let scraped=await chrome.storage.local.get('scrapedProfiles')
        scrapedProfiles=scraped.scrapedProfiles
        scrapeArr=[...scrapedProfiles]
    }


    scrapeDivs.forEach((item,index)=>{
        if(scrapeArr[index]){
            let profileInfo=JSON.stringify(scrapeArr[index])
            item.textContent=profileInfo
        }
        
    })
}

addScraped()


    


multiForm.addEventListener('submit',e=>{
    e.preventDefault()
    let profText1=e.target.querySelector('#profile1').value
    let profText2=e.target.querySelector('#profile2').value
    let queryText=e.target.querySelector('#queryType2').value
    let questionText=e.target.querySelector('#question2').value

    if((!queryText || queryText.length<1) && (!questionText || questionText.length<1)){
        document.querySelectorAll('.errorLog').forEach(item=>{
            item.style.display='block'
        })
        question.style.border='1px solid red'
        queryType.style.border='1px solid red'
    }
    else{
        document.querySelectorAll('.errorLog').forEach(item=>{
            item.style.display='none'
            question.style.border='1px solid black'
            queryType.style.border='1px solid black'
        })
        let profText=[{profText1},{profText2}]

        answer2.setAttribute('placeholder','fetching...')
        var port = chrome.runtime.connect({
            name: "AI answ"
        });

        port.postMessage({profText,queryText,questionText,type:'multi'})
        port.onMessage.addListener(function(msg) {
            answer2.value=msg.answer?msg.answer:msg.message
            // port.disconnect()
        });
    }
})

