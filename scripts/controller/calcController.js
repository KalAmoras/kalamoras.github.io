class calcController {
    constructor(){
        
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        //Converter o locale em atributo facilita as operações
        this._locale = "pt-BR";
        // underline torna privado
        this._currentDate;
        this._operation = []
        this._lastOperator = ''
        this._lastNumber = '';
        this._audioOnOff = false
        //Audio não é nativo mas o JS entende
        this._audio = new Audio('click.mp3')
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
    }

    copyToClipboard(){
        
        let input = document.createElement('input')

        input.value = this.displayCalc;

        document.body.appendChild(input)

        input.select()

        document.execCommand("Copy")

        input.remove();

    }

    pasteFromClipboard(){

        document.addEventListener('paste', e=>{

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text)

        })

    }

    initialize(){    

        //InnerHTML insere um valor no elemento
        //displayCalcEl.innerHTML = 4567;

        /*Coloca o intervalo de tempo e usa a função como parametro e os milissegundos
        let interval = setInterval(()=>{
            this.displayDate = this.currentDate.toLocaleDateString(this._locale)
            this.displayTime = this.currentDate.toLocaleTimeString(this._locale)

        }, 1000);

        //setTimeout para eliminar elementos
        setTimeout(()=>{
            //clearInterval(interval) vai interromper interval
        })*/

        this.setDisplayDateTime();

        setInterval(()=>{
            this.setDisplayDateTime();
        }, 1000)
        
        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=>{
           
            btn.addEventListener('dbclick', e=>{

                this.toggleAudio()

            })
        })    
    }

    toggleAudio(){

        //Forma prática de lidar com boolean binário sem precisar usar ternário
        this._audioOnOff = !this._audioOnOff 
        
    }

    playAudio(){

        if(this._audioOnOff){

            this._audio.currentTime = 0
            this._audio.play()
        }

    }

    initKeyboard(){

        //Key press pressiona tecla
        //Key down segurar tecla
        //Key up soltar tecla
        document.addEventListener('keyup', e=>{

            this.playAudio()

            switch(e.key){
                case 'Escape':
                    this.clearAll()
                    break
                case 'Backspace':
                    this.clearEntry()
                    break
                case '+':                  
                case '-':
                case '/':
                case '*':                    
                case '%':
                    this.addOperation(e.key)            
                    break
                case '=':
                case 'Enter':
                    this.calc();
                    break
                case '.':
                case ',':
                    this.addDot();
                    break    
                case '0':               
                case '1':              
                case '2':             
                case '3':           
                case '4':                
                case '5':             
                case '6':             
                case '7':
                case '8':             
                case '9':
                    this.addOperation(parseInt(e.key))             
                    break
                case 'c':
                    if(e.ctrlKey) this.copyToClipboard()
                    break
            }
        })     
    }

    addEventListenerAll(element, events, fn){
            
        events.split(' ').forEach(event => {

            element.addEventListener(event, fn, false);
        });
    }

    clearAll(){
        this._operation = []
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay()

    }

    clearEntry(){
        this._operation.pop()
        this.setLastNumberToDisplay()

    }

    getLastOperation(){
        return this._operation[this._operation.length-1]
    }

    setLastOperation(value){
        this._operation[this._operation.length -1] = value
    }

    isOperator(value){
        return (['+', '-','*','%', '/'].indexOf(value) > -1)
    }

    pushOperation(value){
        this._operation.push(value);

        if(this._operation.length > 3){

            this.calc()
        }
    }

    getResult(){

        try{

            return eval(this._operation.join(""))
        
        } catch (e) {
            setTimeout(()=>{
                this.setError();
            }, 1)

        }
    }

    calc(){
        let last = ''
        
        this._lastOperator = this.getLastItem()    
        
        if (this._operation.length < 3){

            let firstItem = this._operation[0]
            this._operation = [firstItem, this._lastOperator, this._lastNumber]

        }
        
        if(this._operation.length> 3){

            last = this._operation.pop()            
            this._lastNumber = this.getResult()
        
        } else if (this._operation.length == 3){

            this._lastNumber = this.getLastItem(false)
        }
        
        let result = this.getResult()

        if(last == '%'){
            result /= 100;
            this._operation = [result]

        }else{    
            this._operation = [result]

            if(last) this._operation.push(last)
        }

        this.setLastNumberToDisplay()
    }

    getLastItem(isOperator = true){

        let lastItem

        for(let i = this._operation.length-1; i >= 0; i--){
            
            if(this.isOperator(this._operation[i])==isOperator){
       
                    lastItem = this._operation[i]
                    break;
            }   
        }

        if(!lastItem){

            lastItem = (isOperator) ? this._lastOperator : this._lastNumber
        }
        
        return lastItem

    }

    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0
       
        this.displayCalc = lastNumber
    }

    addOperation(value){
       
        if(isNaN(this.getLastOperation())){
            //Para trocar o operador se o usuário se equivocou
            if(this.isOperator(value)){
                this.setLastOperation(value)
            }else{
                this.pushOperation(value)

                this.setLastNumberToDisplay()

            }
        } else {

            if(this.isOperator(value)){
                this.pushOperation(value)
            }else{
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue)

                this.setLastNumberToDisplay()
            }

            
        }
    }

    setError(){
        this._displayCalc ="Error"
    }

    addDot(){

        let lastOperation = this.getLastOperation()

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return 

        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0. ');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

    }

    execBtn(value){

        this.playAudio()

        switch(value){
            case 'ac':
                this.clearAll()
                break
            case 'ce':
                this.clearEntry()
                break
            case 'soma':
                this.addOperation('+')            
                break
            case 'subtracao':
                this.addOperation('-')           
                break
            case 'divisao':
                this.addOperation('/')
                break
            case 'multiplicacao':
                this.addOperation('*')            
                break
            case 'porcento':
                this.addOperation('%')            
                break
            case 'igual':
                this.calc();
                break
            case 'ponto':
                this.addDot();
                break    
            case '0':               
            case '1':              
            case '2':             
            case '3':           
            case '4':                
            case '5':             
            case '6':             
            case '7':
            case '8':             
            case '9':
                this.addOperation(parseInt(value))             
                break

            default:
                this.setError();
                break    
        }
    }



    initButtonsEvents(){
        // > dentro do querySelector, seleciona as filhas (no caso buttons de g)
        //querySelector seleciona apenas o primeiro da classe/id
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
                

        buttons.forEach((btn, index)=>{

            this.addEventListenerAll(btn, "click drag", e=>{

                let textBtn = btn.className.baseVal.replace("btn-", "")

                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e=>{
                
                btn.style.cursor = "pointer";
            });
        })
    }

    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            //Para personalizar o formato
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale)
    }





    //Geter
    get displayCalc(){
        //Anterior
        //return this._displayCalc;
        //Posterior
        return this._displayCalcEl.innerHTML;
    }

    //Setter
    set displayCalc(value){
        //Anterior
        //this._displayCalc = valor;
        //Posterior
        if(value.toString().length > 10){
            this.setError()
            return false
        }

        this._displayCalcEl.innerHTML = value;
    }

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        return this._timeEl.innerHTML = value;
    }


    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        return this._dateEl.innerHTML = value;
    }


    get currentDate(){
        //Anterior
        //return this._currentDate;
        //Posterior
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }
}