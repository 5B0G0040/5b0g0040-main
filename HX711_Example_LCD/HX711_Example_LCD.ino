/*
  需先安裝Bogdan Necula的HX711函式庫
  https://github.com/bogde/HX711
 */

#include "HX711.h"
#include <LiquidCrystal_PCF8574.h>

LiquidCrystal_PCF8574 lcd(0x27);  // 設定i2c位址，一般情況就是0x27和0x3F兩種

// 接線
const int DT_PIN = 6;
const int SCK_PIN = 5;
const int BUZZER_PIN = 7;  // 定義蜂鳴器的接腳

const int scale_factor = 433; //比例參數，從校正程式中取得

HX711 scale;

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing the scale");

  scale.begin(DT_PIN, SCK_PIN);
  lcd.begin(16, 2); // 初始化LCD
  lcd.setBacklight(255);
  lcd.clear();

  pinMode(BUZZER_PIN, OUTPUT);  // 設置蜂鳴器的接腳為輸出模式

  Serial.println("Before setting up the scale:"); 
  
  Serial.println(scale.get_units(5), 0);	//未設定比例參數前的數值

  scale.set_scale(scale_factor);       // 設定比例參數
  scale.tare();				        // 歸零

  Serial.println("After setting up the scale:"); 

  Serial.println(scale.get_units(5), 0);  //設定比例參數後的數值

  Serial.println("Readings:");  //在這個訊息之前都不要放東西在電子稱上
}

void loop() {
  
  float weight = scale.get_units(10);
  Serial.println(weight, 0); // 在Serial Monitor上顯示重量
  lcd.clear();
  lcd.setCursor(0, 0);  //設定游標位置 (字,行)
  lcd.print("Weight: ");
  lcd.setCursor(9, 0);

  //避免出現負數
  if(weight <= 0){
    weight = 0;
  }

  lcd.print(weight, 0); // 在LCD上顯示重量
  lcd.setCursor(13, 0);
  lcd.print("g");

  // 如果重量超過100克，啟動蜂鳴器
  if(weight > 3000) { //預設超過3kg才會叫
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  scale.power_down();			        // 進入睡眠模式
  delay(1000);
  scale.power_up();               // 結束睡眠模式
}
