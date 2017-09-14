// javascript sources for Basic Arithmetics
"use strict";
var cellsize=10, fontSize=10;
var colours=new Array("white","lime","yellow","red","aqua","fuchsia","blue");
var language=navigator["language"];
if (!language) language=navigator["userLanguage"];
language=(language? language.substr(0,2).toLowerCase() : "en");
var sep=".", hint="H";
var keyboard;
if (language="de") sep=",";
var trans=new Array();
var values=new Array();
var resultIds;
var result, carry, n_correct, n_wrong, total_correct=0, total_wrong=0;
var requestFinish=0;
var nextEmo=new Array(0,0,0); var nextEmoTotal=new Array(0,0,0);
var emoticons=new Array();
    emoticons[0]=new Array // bad
	(0x1F620,0x1F621,0x1F622,0x1F623,0x1F625,0x1F628,0x1F629,0x1F62A
	,0x1F62B,0x1F62D,0x1F630,0x1F631,0x1F632,0x1F633,0x1F61E);
    emoticons[1]=new Array // neutral
	(0x1F610,0x1F613,0x1F614,0x1F616,0x1F618,0x1F61A
	,0x1F61C,0x1F61D,0x1F635,0x1F636);
    emoticons[2]=new Array // good
	(0x1F601,0x1F602,0x1F603,0x1F604,0x1F605,0x1F606,0x1F606,0x1F607
	,0x1F608,0x1F609,0x1F60A,0x1F60B,0x1F60C,0x1F60D,0x1F60E,0x1F60F
	,0x1F637,0x1F638,0x1F639,0x1F63A,0x1F63B,0x1F63C,0x1F63D,0x1F63E
	,0x1F63F,0x1F640);
var debg=0, show_opt=0; var tst=0; var curr_id=-1; var m, prevM;
var results=new Array(); 
var maxId=-1;
var nRows=1, nCols=3;
var browser=navigator.appName;
var userAgent=navigator.userAgent;
var ie=0; 
if (browser.indexOf("Microsoft")>=0) {
    ie=1;
    colours[0]="silver"; // inner border lines sometimes not visible
    }

function setOnClick(selectors) {
  // Set click actions given element types:
    var bId = document.querySelectorAll(selectors);
    var i, id, fct, idClass;
    for (i = 0; i < bId.length; i++) {
	id=bId[i].id;
	idClass=id.substr(0,2);
	if (idClass=='he') { fct=function() { help_() }; }
	else if (idClass=='ic') { fct=function() { Finish() }; }
	else if (idClass=='kb') { fct=function() { change(this.id) }; }
	else if (idClass=='op') { fct=function() { new_(this.id) }; }
	else if (idClass=='rs') { fct=function() { highlight(this.id) }; }
	if (fct!=undefined) bId[i].onclick=fct;
	}
    }

function _(word) {
    var str, tmp;
    if (word == undefined) { return ""; }
    tmp=language+"-"+word;
    str=trans[tmp];
    if (str == undefined || str == "") { str=word; }
    return str;
    } // _()

function int_trans() {
    trans['de-Help']="Hilfe";
    trans['de-Exercises in']="Übungen in";
    trans['de-Upper buttons']="Oberste Buttons";
    trans['de-Basic Arithmetic Operations']="Grundrechenarten";
    trans['de-less digits']="weniger Stellen";
    trans['de-more digits']="mehr Stellen";
    trans['de-less rows']="weniger Zeilen";
    trans['de-more rows']="mehr Zeilen";
    trans['de-or digits of 2nd value']="bzw. Stellen für 2. Wert";
    trans['de-small boxes']="niedrige Kästchen";
    trans['de-carry']="Übertrag";
    trans['de-normal boxes']="normale Kästchen";
    trans['de-result']="Resultat";
    trans['de-Use bottom buttons as keyboard']
	="Die Eingabe erfolgt über die unteren Buttons";
    trans['de-input field has yellow background']
	="und geht ins gelb hinterlegte Feld";
    trans['de-klick to select field']
	="ggf. vorher ins gewünschte Feld klicken";
    trans['de-show next part of result']="zeigt nächsten Ergebnisteil";
    //trans['de-Klick Adam Riese logo twice to exit']
	//="Ende mit 2* Klick auf Adam Riese-Logo";
    trans['Back button apears after scrolling from top side']
        ="Zurück-Button erscheint, wenn von oben gewischt wird."
    } // int_trans()

function help_(str) {
    if (str==undefined) {
	str=_('Upper buttons')+" : "+_('Basic Arithmetic Operations');
	str+="<br>< : "+_('less digits')+", > : "+_('more digits');
	str+="<br>&or; : "+_('less rows')+",  &and; : "+_('more rows');
	str+=" ("+_('or digits of 2nd value')+")";
	str+="<br>"+_('small boxes')+" : "+_('carry');
	str+="<br>"+_('normal boxes')+" : "+_('result');
	str+="<br>"+_('Use bottom buttons as keyboard');
	str+="<br>"+_('input field has yellow background');
	str+="<br>("+_('klick to select field')+").";
	str+="<br>"+hint+" : "+_('show next part of result');
	//str+="<br>"+_('Klick Adam Riese logo twice to exit');
        str+="<br>"+_('Back button apears after scrolling from top side');
	}
    else str=_(str);
    document.getElementById('dialog').innerHTML=str;
    } // help_()

function alrt(str) {
    document.getElementById('debug').innerHTML+=str+" ";
    } // alrt()

function read_params(searchstr) { // interpret parameters from url
    var regexp, par, src='&'+searchstr.substr(1)+'&';
    regexp=/\&l\=([^\&]+)\&/; par=regexp.exec(src); if (par) language=par[1];
    regexp=/\&m\=([^\&]+)\&/; par=regexp.exec(src); if (par) m=par[1];
    regexp=/\&t\=([^\&]+)\&/; par=regexp.exec(src); if (par) debg=par[1];
    } // read_params()

function debg_() { // currently not used
    var str="Debug ";
    debg=1-debg; // toggle debg variable to be used for debug
    tst++; if (tst>3) tst=0; // 
    if (debg==0) { str+="off"; } else { str+="on"; }
    if (tst>0) str+=", test on";
    alrt(str);
    } // debg_

function set_emoticon(correct) {
    var emoticon, n, colour, grade;
    if (correct<0) { grade=1; colour="aqua"; }
    else {
	if (correct>0) 
	    { n_correct++; total_correct++; grade=2; } 
	else { n_wrong++; total_wrong++; grade=0; }
	colour=getColor(n_correct,n_wrong);
	document.getElementById('icon').style.backgroundColor
	    =getColor(total_correct,total_wrong);
	}
    emoticon=getEmoticon(grade,nextEmo);
    document.getElementById('emoticon').innerHTML=emoticon;
    document.getElementById('emoticon').style.backgroundColor=colour;
    }

function getEmoticon(grade,next) { // 0=bad, 1=neutral, 2=good
    var emo, i;
    emo=emoticons[grade][next[grade]];
    next[grade]++; if (next[grade]>=emoticons[grade].length) next[grade]=0;
    return "&#x"+emo.toString(16)+";";
    }
function getColor(good,bad) {
    var red, green, blue="00";
    green=Math.floor(255*good/(good+bad));
    red=255-green;
    if (good<bad) { red=255; }
    else if (good==bad) { red=255; green=255; }
    else { green=255; }
    red=red.toString(16); if (red.length==1) red="0"+red;
    green=green.toString(16); if (green.length==1) green="0"+green;
    return "#"+red+green+blue;
    } 

function write_row(cols,value,style_,Ids) { // 
    // Ids() : hide value and store digits in results() for comparison
    // cols<0 : start hiding from position -col

    value=""+value;
    if (cols==undefined || cols==0) cols=value.length;
    
    var str, len, l, l1, id, iId, tab, tmp, buttons=0, digit, hide=0, id_;
    if (cols<0) { hide=-cols; cols=value.length; }

	if (value.substr(0,1).toLowerCase()=="k")
	    { buttons=1; value=value.substr(1); cols--; }
	else {
	    len=value.length;
	    if (value.substr(0,1).match(/[\-\+]/)) 
		{ tmp=value.substr(0,1); value=value.substr(1); }
	    else { tmp=""; }
	    for (l=0; l<cols-len; l++) { tmp=tmp+" "; }
	    value=tmp+value; 
	    }
    str='';tmp=''; iId=0;
    str+='<tr>'; 
    l1=-1; 
    for (l=0; l<cols; l++) {
	digit=value.substr(l,1);
	if ((Ids!=undefined || buttons>0) && digit!=' ' && debg<=0 && l>=hide) {
	    if (buttons>0) { id_="kb"+l; }
	    else { 
		id=Ids[iId]; iId++; results[id]=digit; id_="rs"+id; 
		}
	    l1=l;
	    str+='<td class="'+style_+'" '+'id="'+id_+'">';
	    str+=(buttons==0? '<span id="s'+id+'">&nbsp;</span>' : digit);
	    str+='</td>'; 
	    }
	else { 
	    if (style_!=undefined) {
		tmp=(digit!=' '? "no" : "x"); 
		str+='<td class="'+tmp+style_+'">'; }
	    else { str=str+'<td>'; }
	    if (digit!=' ') { str+=digit; }
	    str+='</td>';
	    }
	}
    str=str+'</tr>';
    //str=str+'</table>';
    return str;
    } // write_row()

function change(id) {
    var curr_val, check_, col, len_, correct=1, i, j;
    curr_val=document.getElementById(id).innerHTML; 
    if (curr_id>maxId) return;
    if (curr_val==hint) { curr_val=results[curr_id]; correct=-1; }
    // check result/carry + highlight next element
     // ignore carry, if next result digit is correct:
    if (curr_val!=results[curr_id] && carry!="" && curr_id%2==0 
	&& curr_val==results[curr_id+1]) { 
	highlight(curr_id,0);
	curr_id++; 
	}
    // document.getElementById('s'+curr_id).innerHTML=curr_val;
    if (curr_val!=results[curr_id]) 
	{ highlight(curr_id,3,curr_val); correct=0; }
    else {
	highlight(curr_id,1,curr_val); 
	if (m==':' && curr_val!=sep) { // show previous sub-results smaller
	    i=0;
	    while (i<=resultIds.length && resultIds[i]!=curr_id) i++;
	    if (i<=resultIds.length) {
		if (i>0 && resultIds[i]==resultIds[i-1]+1) i--; // i-1:sep
		j=(i<=0? 0 : resultIds[i-1])+1;
		while (j<resultIds[i]) {
		  if (document.getElementById('rs'+j))
		      { document.getElementById('rs'+j).style.fontSize="small"; }
		  j++; 
		  }
		}
	    }
	curr_id++;
	while (curr_id<=maxId && !document.getElementById('rs'+curr_id)) 
	    curr_id++;
	if (curr_id<=maxId)  highlight(curr_id,2);
	}
    //if (correct>=0) 
    set_emoticon(correct);
    }

function highlight(id,colour,val) {
    if (colour==undefined) colour=2; 
    if ((""+id).substr(0,2)=='rs') id=id.substr(2);
    var col=colours[colour];
    var col0=colours[0];
    //alrt("h"+curr_id);
    if (!document.getElementById('s'+id) ||
	document.getElementById('s'+id).innerHTML==results[id]) return;
    if (curr_id>=0 && document.getElementById('rs'+curr_id)) {
	document.getElementById('rs'+curr_id).style.backgroundColor=col0;
	}
    curr_id=id;
    if (document.getElementById('rs'+curr_id)) {
	document.getElementById('rs'+curr_id).style.backgroundColor=col;
	if (val!=undefined) document.getElementById('s'+curr_id).innerHTML=val;
	}
    } // highlight

function subtraktion () {
    var i, j, x, sum=0, minu, tmp, tmp2, f, str="", Ids=new Array();
    if (nCols<1) { nCols=1; }
    if (nRows<2) { nRows=2; }
    var max=Math.pow(10,nCols);
    var carry_sum=new Array(0,0,0,0,0,0,0,0,0,0);
    for (i=1; i<nRows; i++) {
	x = Math.floor(Math.random() * max);
	if (x<2) x=9-x;
	values[i]=-x;
	str+=write_row(nCols+1,values[i]);
	sum=sum+x;
	j=0; while (x>0) {
	    carry_sum[j]+=x % 10;
	    x=(x-(x%10))/10;
	    j++;
	    }
	}
    result=Math.floor(Math.random() * max);
    if (result<2) result=9-result;
    minu=sum+result; 
    values[0]=minu;
    str=write_row(nCols+1,values[0])+str;
    carry=0; f=1;
    for (j=0; j<nCols; j++) {
	tmp=carry_sum[j]-minu%10;
	if (tmp>0) { 
	    tmp2=(tmp-tmp%10)/10; if (tmp%10>0) tmp2++;
	    carry=carry+f*tmp2; carry_sum[j+1]+=tmp2;
	    }
	f*=10;
	minu=(minu-minu%10)/10;
	}
    result=""+result; carry=""+carry;
    for (j=0; j<carry.length; j++) { Ids[j]=2*(carry.length-j); }
    carry="         ".substr(0,nCols-carry.length)+carry; // nCols+1 ???
    str+=write_row(nCols,carry,"carry",Ids); // carry
    for (j=0; j<result.length; j++) { resultIds[j]=2*(result.length-j)-1; }
    result="         ".substr(0,nCols+1-result.length)+result;
    str+=write_row(nCols+1,result,"box",resultIds); // result
    maxId=2*result.length-1;
    return str;
    } // subtraktion

function addition () {
    var i, j, x, sum=0, keyb, minu, tmp, tmp2, f, str="", Ids=new Array();
    if (nCols<1) { nCols=1; }
    if (nRows<2) { nRows=2; }
    var max=Math.pow(10,nCols);
    var carry_sum=new Array(0,0,0,0,0,0,0,0,0,0);
    for (i=0; i<nRows; i++) {
	x = Math.floor(Math.random() * max);
	if (x<2) x=9-x;
	values[i]=x;
	str+=write_row(nCols+1,values[i]);
	sum=sum+x;
	j=0; while (x>0) {
	    carry_sum[j]+=x % 10;
	    x=(x-(x%10))/10;
	    j++;
	    }
	}
    result=sum;
    carry=0; f=1;
    for (j=0; j<nCols; j++) {
	tmp=carry_sum[j]-sum%10;
	if (tmp>0) { 
	    tmp2=(tmp-tmp%10)/10; if (tmp%10>0) tmp2++;
	    carry=carry+f*tmp2; carry_sum[j+1]+=tmp2;
	    }
	f*=10;
	sum=(sum-sum%10)/10;
	}
    result=""+result; carry=""+carry;
    for (j=0; j<carry.length; j++) { Ids[j]=2*(carry.length-j); }
    carry="         ".substr(0,nCols-carry.length)+carry; // nCols+1 ???
    str+=write_row(nCols,carry,"carry",Ids); // carry
    for (j=0; j<result.length; j++) { resultIds[j]=2*(result.length-j)-1; }
    result="         ".substr(0,nCols+1-result.length)+result;
    str+=write_row(nCols+1,result,"box",resultIds); // result
    maxId=2*result.length-1;
    return str;
    } // addition

function multiplikation () {
    var i, j, x, sum=0, keyb, minu, tmp, tmp2, f, f10, str, col1,col2, 
	Ids=new Array();
    if (nCols<1) { nCols=1; }
    if (nRows<1) { nRows=1; }
    var max=Math.pow(10,nCols);
    var val1=Math.floor(Math.random()*Math.pow(10,nCols));
    if (val1<2) val1=9-val1;
    var val2=Math.floor(Math.random()*Math.pow(10,nRows));
    if (val2<2) val2=9-val2;
    val2=""+val2;
    tmp=""+val1;
    col1=tmp.length;
    col2=val2.length;
    tmp2=""+val1+"*"+val2;
    str=write_row(tmp2.length,tmp2);
    f10=Math.pow(10,col2-1);
    maxId=0;
    for (i=0; i<col2; i++) {
	f=parseInt(val2.substr(i,1));
	x = val1*f;
	sum+=x*f10;
	f10/=10;
	//if (x==0) continue;
	x=""+x;
	for (j=x.length-1; j>=0; j--) { maxId++; Ids[j]=maxId; }
	x="         ".substr(0,col1+i+2-x.length)+x;
	str+=write_row(col1+i+2,x,"box",Ids);
	}
    if (col2>1) {
	result=""+sum;
	for (j=result.length-1; j>=0; j--) { maxId++; resultIds[j]=maxId; }
	result="         ".substr(0,col1+col2+1-result.length)+result;
	str+=write_row(result.length,result,"result",resultIds);
	}
    return str;
    } // multiplikation

function division () {
    var hide, result="", res1, keyb, minu, tmp, tmp2, l1, str, col1,col2, j,
	iRes, Ids=new Array(), msg="", iRow;
    if (nCols<1) { nCols=1; }
    if (nRows<1) { nRows=1; }
    var max=Math.pow(10,nCols);
    var val1=Math.floor(Math.random()*Math.pow(10,nCols));
    if (val1<2) val1=9-val1;
    var val2=Math.floor(Math.random()*Math.pow(10,nRows));
    if (val2<2) val2=9-val2;
    // problems if result <1 (0.xxx):
    if (val1<val2) { tmp=val1; val1=val2; val2=tmp; } 
    val1=""+val1;
    col1=val1.length;
    tmp=""+val2;
    col2=tmp.length;
    result=""+val1+":"+val2+"=";
    hide=result.length;
    str="";
    var nachKomma=2; if (col1<col2) nachKomma=col2-col1+2;
    var val=val1.substr(0,col2); l1=col2;
    if (parseInt(val)<val2) { val+=val1.substr(l1,1); l1++; }
    val=parseInt(val);
    //alrt("v="+val+" l1="+l1+" c1="+col1+" c2="+col2);
    maxId=0; iRes=0;
    while (l1<=col1+nachKomma && (val>0 || l1<=col1)) {
	res1=Math.floor(val/val2);
	result+=res1;
	maxId++;
	resultIds[iRes]=maxId; 
	// don't show parts for next intermediate result:
	if (l1==col1+nachKomma) break; 
	msg+=maxId+"="+res1+" ";
	iRes++;
	tmp=res1*val2;
	val-=tmp;
	tmp2=""+tmp;
	for (j=tmp2.length-1; j>=0; j--) { maxId++; Ids[j]=maxId; }
	tmp2="       ".substr(0,l1-tmp2.length)+tmp2;
	str+=write_row(tmp2.length,tmp2,"box",Ids);
	val*=10;
	if (l1<col1) val+=parseInt(val1.substr(l1,1));
	tmp2=""+val;
	for (j=tmp2.length-1; j>=0; j--) { maxId++; Ids[j]=maxId; }
	tmp2="       ".substr(0,l1+1-tmp2.length)+tmp2;
	str+=write_row(tmp2.length,tmp2,"result",Ids);
	if (l1==col1 && val>0) 
	    { result+=sep; maxId++; resultIds[iRes]=maxId; iRes++; }
	l1++;
	}
    result="         ".substr(0,col1+col2+1-result.length)+result;
    str=write_row(-hide,result,"result",resultIds)+str;
    //alrt(msg);
    return str;
    } // division

function write_table(calc) {
    var tab, str="", n, x; var border=0;
    //if (m==':') str+="<br>"+keyboard;
    tab='<table border="0" cellpadding="0" cellspacing="0">';
    str+=tab;
    str+=calc;
    str+='</table>';
    //str+=write_row(0,"k01234");    // keyboard
    //str+='<br>';
    //str+=write_row(0,"k56789"+addKeys);    // keyboard
    //if (m!=':') str+=keyboard;
    document.getElementById("calculate").innerHTML =str;
    curr_id=-1;
    highlight(1,2);
    // alert(" r="+result);
    }

function new_ (m_) {
    var calc="", tmp, size, colour, grade, keys_, kb, nokb;
    if (m_==undefined) { m_=m; } 
    else { // m=m_; 
	tmp=m_.substr(2);
	if (m_.substr(0,2)=='op') { m=tmp; }
	else { // change parameters
	    switch (tmp) {
	      case "0": if (nCols>1) nCols--; break;
	      case "1": nCols++; break;
	      case "2": if (nRows>1) nRows--; break;
	      default: nRows++; break;
	      }
	    }
	}
    if (n_correct!=undefined && n_correct==0 && n_wrong==0) n_correct=undefined;
    if (n_correct!=undefined) {
	n_wrong+=check_result();
	colour=getColor(n_correct,n_wrong);
	tmp=Math.floor((n_correct+n_wrong)/4);
	if (n_correct>n_wrong+tmp) { grade=2; }
	else if (n_correct>n_wrong-tmp) { grade=0; }
	else { grade=1; }
	size=Math.floor(fontSize/2)+n_correct;
	if (size>fontSize) size=fontSize;
	tmp="<span style='background-color:"+colour+"; font-size:"+size+"pt;'>"
	    +prevM+getEmoticon(grade,nextEmoTotal)
	    +"</span>";
	// alrt(colour);
	document.getElementById('Total').innerHTML+=tmp;
	document.getElementById('debug').innerHTML="";
	}
    carry=""; n_correct=0; n_wrong=0; tmp=""; kb="keyboard2"; nokb="keyboard1";
    resultIds=new Array();
    requestFinish=0;
    keys_="0123456789"+hint;
    switch (m) {
      case "1": calc=subtraktion(); break;
      case "2": calc=multiplikation(); break;
      case "3": calc=division();
	    kb="keyboard1"; nokb="keyboard2"; keys_=sep+keys_;
	    break;
      default: calc=addition(); break;
      }
    if (debg>0) alrt("m="+m);
    prevM=document.getElementById("op"+m).innerHTML;
    tmp+=hint; // show next part of result
    write_table(calc);
    document.getElementById(kb).innerHTML=
	'<table>'+write_row(0,"k"+keys_,"kb")+'</table>';
    document.getElementById(nokb).innerHTML="";
    setOnClick("td");
    } // new_

function check_result() {
    var i, id, cnt=0, msg="";
    // ??? results sometimes has undefined elements (too many resultIds)
    for (i=0; i<=resultIds.length; i++) {
	id=resultIds[i];
	if (carry!="" && id%2==0) continue;
	if (results[id]==undefined) break;
	if (!document.getElementById('s'+id) ||
	    results[id]!=document.getElementById('s'+id).innerHTML) {
	    msg+=i+":"+id+":";
	    if (document.getElementById('s'+id)) { cnt++; }
	    else { msg+"!"; }
	    msg+=results[id]+" ";
	    }
	}
    //if (msg!="") alrt(msg+" res="+result);
    return cnt;
    }

function changeStyle (styleId,attr,val) {
    styleId=styleId.toLowerCase();
    var i=0;
    while (document.styleSheets[i]) {
	var stylesheet=document.styleSheets[i], j=0;
	i++;
	while (j<stylesheet.cssRules.length) {
	    var rule=stylesheet.cssRules[j];
	    if (rule.selectorText.toLowerCase()==styleId) {
		rule.style[attr]=val;
		i=-1;
		break;
		}
	    else j++;
	    }
	}
    if (i>=0) { alrt("changeStyle: "+styleId+" not found"); }
    else if (debg>0) alrt("CS "+styleId);
    }


function mobile_ () {
    if (userAgent.match(/Android|Mobile/) || Math.abs(debg)==2) {
	fontSize=20;
	changeStyle("html","font-size",""+fontSize+"pt");
	changeStyle("td","font-size","35pt");
	//if (debg!=0) 
	  alrt("mobile");
	}
    else if (debg>0) alrt("*");
    }

function Finish() { 
    requestFinish++;
    if (requestFinish==1) return;
    // window.close() does not work in current browsers and in PhoneGap app
    if (typeof navigator.app !== 'undefined') {
            navigator.app.clearHistory();
	    navigator.app.exitApp(); // exit app
	    }
    else if(navigator.device) { navigator.device.exitApp(); }
    //else if (window.history) { window.history.back(); }
    else { window.close(); } // usually not working 
    } // Finish

debg=0;
int_trans(); // preset variables for translated text messages
if (window.location.search != "") { read_params(window.location.search); }
document.getElementById('title').innerHTML
    =_('Exercises in')+" "+_('Basic Arithmetic Operations');
document.getElementById('help').innerHTML=_('Help');
mobile_();
setOnClick("img, button");
m=(m==undefined ? 1 : parseInt(m));
if (isNaN(m) || m<0 || m>3) m=1; // start with minus
new_("op"+m);
//debg_();
  // Show all smileys (only in debug mode):
    if (debg>2) {
	var msg="";
	for (var i=0; i<=2; i++) {
	  for (var j=0; j<emoticons[i].length; j++) {
	    var emo=emoticons[i][j]; 
	    msg+=(emo==undefined?"?"+i+j:"&#x"+emo.toString(16)+";");
	    }
	  msg+="<br>";
	  }
	for (var k in navigator) { msg+=k+"="+navigator[k]+'&nbsp;'; }
	alrt(msg);
	}
