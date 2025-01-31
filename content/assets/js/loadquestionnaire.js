
$.getJSON("expansions.json", function(data){

    if (typeof fhirQ !== 'undefined') {
       delete fhirQ.text;
     
 
    exps = data;
    // Define a FHIR Questionnaire
    delete fhirQ.text;
    // find the valuesets contained and replace them with the expanded version
    if(fhirQ.hasOwnProperty('contained')){
      fhirQ.contained.forEach(function (contained, i) {
        if (contained.resourceType == 'ValueSet'){
          vset = contained;
          if (("entry" in exps)&&(exps.entry.some(e => e.resource.id === vset.id))){
            contained = exps.entry.find(e => e.resource.id === vset.id).resource;
            fhirQ.contained[i] = contained
          }
        }
      });
    }  
 
    function listValueSets(obj, found2)
      {
        found2=[];
        if (obj.hasOwnProperty('answerValueSet')){
              url = obj['answerValueSet'];
              found2.push(url);
            };
        if (obj.hasOwnProperty('item')){
          obj['item'].forEach(function (item) {
            var subtree=listValueSets(item, found2);
            if (Array.isArray(subtree) && subtree.length){
              found2.push(listValueSets(item, found2));
            }
          })
        }
        return found2
      };
 
 
      var otherValueSets = listValueSets(fhirQ);
 
      if(Array.isArray(otherValueSets) && otherValueSets.length){
        otherValueSets.forEach(function (vsURL, i) {
          if (("entry" in exps)&&(exps.entry.some(e => e.resource.url === vsURL[i]))){
            newContainedVS = exps.entry.find(e => e.resource.url === vsURL[i]).resource;
            if (!fhirQ.hasOwnProperty('contained')) {fhirQ.contained=[]}
            fhirQ.contained.push(newContainedVS);
 //                console.log("added URL:"+vsURL);       
          } 
        });
      };
 
 //        console.log(listValueSets(fhirQ));        
 
 
    function findById(o, id) {
      //Early return
      if( o.id === id ){
        return o;
      }
      var result, p; 
      for (p in o) {
          if( o.hasOwnProperty(p) && typeof o[p] === 'object' ) {
              result = findById(o[p], id);
              if(result){
                  return result;
              }
          }
      }
      return result;
    }
 
    // Add the form to the page
    LForms.Util.addFormToPage(fhirQ, 'formContainer');
    
    // Define the function for showing the QuestionnaireResponse
    function showQR() {
      var qr = LForms.Util.getFormFHIRData('QuestionnaireResponse', 'R4');
      window.alert(JSON.stringify(qr, null, 2));
    }
 
 
    }
 
  }).fail(function(){
        console.log("An error has occurred.");
  })
 
 