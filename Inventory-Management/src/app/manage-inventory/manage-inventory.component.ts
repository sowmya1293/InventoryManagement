import { Inventory } from '../Inventory';
import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-manage-inventory',
  templateUrl: './manage-inventory.component.html',
  styleUrls: ['./manage-inventory.component.css']
})
export class ManageInventoryComponent implements OnInit {
  public storeInventory: Inventory[] = [];
  public inputValue: string;
  public storeCommand;
  public report: boolean;
  public alreadyExists: boolean;
  public value: number = 0;
  public soldItems: number = 0;
  public costPriceDeletedItems: number = 0;
  public profitFromLastReport: number;
  public storeQuantity: number = 0;
  public oldSellingPrice: number;
  public sellingPriceUpdated: boolean;
  public message: string;
  public toastMessage: string;
  public showMessage: boolean;
  private subscription: Subscription;
  private timer: Observable<any>;
  //public count: number;
  
  constructor() {
    //type Inventory = {itemName: string; costPrice: number; sellingPrice: number; quantity: number; value: number};
    
   }

  ngOnInit() {
  }
  
  getCommand(command: string){
    this.storeCommand = command.split(" ");
    this.inputValue = "";
    let commandType = this.storeCommand[0];
    let itemName = this.storeCommand[1];
    let costPrice = this.storeCommand[2];
    let sellingPrice = this.storeCommand[3];   
    if(commandType.includes("create")){
      if(this.storeCommand.length!= 4){
        this.message = "Improper command format";
      }
      else{
      //this.report = false;
      this.initializeProfitAndTotalValue();
      let index = this.storeInventory.findIndex(searchItem => searchItem.itemName === itemName);
      if(index!= -1){
        this.alreadyExists = true;
        this.message = "";
        this.inputValue = "";
      }
      else{
      this.alreadyExists = false;
      this.message = "";        
      this.create(itemName, costPrice, sellingPrice);
      }
      }
    }
    
    else if(commandType.includes("delete")){
      if(this.storeCommand.length!= 2){
        this.message = "Improper command format";
      }
      else{
      //this.report = false;
      this.message = "";
      this.initializeProfitAndTotalValue();
      let itemName = this.storeCommand[1];
      this.deleteItem(itemName);
      }
    }
    
    else if(commandType.includes("updateBuy")){
      if(this.storeCommand.length!= 3){
        this.message = "Improper command format";
      }
      else{
      //this.report = false;
      this.message = "";
      this.initializeProfitAndTotalValue();
      let itemName = this.storeCommand[1];
      let quantity = this.storeCommand[2];
      this.updateBuy(itemName, quantity);
      }
    }
    
    else if(commandType.includes("updateSell")){
      if(this.storeCommand.length!= 3){
        this.message = "Improper command format";
      }
      else{
      //this.report = false;
      this.message = "";
      this.initializeProfitAndTotalValue();
      let itemName = this.storeCommand[1];
      let quantity = this.storeCommand[2];
      this.updateSell(itemName, quantity);
      }
    }
    
    else if(commandType.includes("report")){
      this.message = "";
      this.calTotalValue();
    }
    
    else if(commandType.includes("updateSellPrice")){
      if(this.storeCommand.length!= 3){
        this.message = "Improper command format";
      }
      else{
      this.message = "";
      //this.report = false;
      this.initializeProfitAndTotalValue();
      let itemName = this.storeCommand[1];
      let newSellingPrice = this.storeCommand[2];
      this.updateSellingPrice(itemName, newSellingPrice);
      }
    }
    
    else{
      this.message = "Command not recognized";
    }
  }
  
  create(itemName: any, costPrice: any, sellingPrice: any){
    let count = this.storeInventory.length;
    this.storeInventory[count] = {itemName: itemName, costPrice: costPrice, sellingPrice: sellingPrice, quantity: 1, value: costPrice};
    this.toastMessage = "Item has been created";
    this.showToastMessage();
    /*this.storeInventory[count].costPrice = costPrice;
    this.storeInventory[count].sellingPrice = sellingPrice;*/  
    console.log(this.storeInventory);
  }
  
  deleteItem(itemName: any){
     let index = this.storeInventory.findIndex(searchItem => searchItem.itemName === itemName);
     let tempCostPriceOfDeletedItems = (+this.storeInventory[index].costPrice) * (this.storeInventory[index].quantity);
     this.costPriceDeletedItems = tempCostPriceOfDeletedItems + this.costPriceDeletedItems;
     this.storeInventory.splice(index, 1);
     this.toastMessage = "Item has been deleted";
    this.showToastMessage();
     console.log(this.storeInventory);
  }
  
  updateBuy(itemName: any, quantity: any){
    let itemQuantity = +quantity;
    let index = this.storeInventory.findIndex(searchItem => searchItem.itemName === itemName);
      //this.storeInventory[index].quantity = this.storeInventory[index].quantity + itemQuantity;
      this.storeInventory[index].quantity = itemQuantity;
      let costPrice = +this.storeInventory[index].costPrice;
      let totalQuantity = +this.storeInventory[index].quantity;
      let totalValue = costPrice * totalQuantity;
      this.storeInventory[index].value = totalValue;
      this.toastMessage = "Item quantity has been updated";
      this.showToastMessage();
      console.log(this.storeInventory);
  }

  updateSell(itemName: any, quantity: any){
    let itemQuantity = +quantity;
    this.storeQuantity = this.storeQuantity + itemQuantity;
    let index = this.storeInventory.findIndex(searchItem => searchItem.itemName === itemName);
      this.storeInventory[index].quantity = this.storeInventory[index].quantity - itemQuantity;
      let costPrice = +this.storeInventory[index].costPrice;
      let totalQuantity = +this.storeInventory[index].quantity;
      let totalValue = costPrice * totalQuantity;
      this.storeInventory[index].value = totalValue;
      let tempPrice = (+this.storeInventory[index].sellingPrice) - (+this.storeInventory[index].costPrice);
      let tempSoldItems = tempPrice * itemQuantity;
      this.soldItems = this.soldItems + tempSoldItems;
      this.toastMessage = "Item has been sold";
      this.showToastMessage();
      console.log(this.storeInventory);
  }
  
  calTotalValue(){
    if(this.sellingPriceUpdated === true){
      this.profitFromLastReport = (this.soldItems + this.oldSellingPrice) - this.costPriceDeletedItems;
    }
    else{
    console.log(this.soldItems);
    console.log(this.costPriceDeletedItems);
    this.profitFromLastReport = this.soldItems - this.costPriceDeletedItems;
    }
    for(let i=0;i<this.storeInventory.length;i++){
      this.value = +this.storeInventory[i].value + this.value;
    }
    this.soldItems = 0;
    this.costPriceDeletedItems = 0;
    this.report = true;
  }
  
  updateSellingPrice(itemName: any, newSellingPrice: any){
    this.sellingPriceUpdated = true;
    let index = this.storeInventory.findIndex(searchItem => searchItem.itemName === itemName);
    //this.storeInventory[index].oldSellingPrice = this.storeInventory[index].sellingPrice;
    this.storeInventory[index].sellingPrice = newSellingPrice;
    this.oldSellingPrice = this.soldItems;
    this.toastMessage = "Item's selling price has been updated";
    this.showToastMessage();
    //this.storeInventory[index].oldQuantity = this.storeQuantity;
  }
  
  initializeProfitAndTotalValue(){
      this.report = false;
      this.profitFromLastReport = null;
      this.value = 0;
      //this.costPriceDeletedItems = 0;
  }
  
  showToastMessage(){
    this.showMessage = true;
    this.timer = Observable.timer(1000);
    this.subscription = this.timer.subscribe(() => {
        this.showMessage = false;
    });
 
  }

}
