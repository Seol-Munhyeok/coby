#include <iostream>
#include <cstring>
using namespace std;

int main(){
    char list[99];
    cin >> list;
    for(int i=0;i<strlen(list);i++){
        for(int j=i;j<strlen(list);j++){
            if(list[i]<list[j]){
                int tmp = list[i];
                list[i] = list[j];
                list[j] = tmp;
            }
        }
    }
    for(int i=0;i<strlen(list);i++){
        printf("%c",list[i]);
    }
}