#define _CRT_SECURE_NO_WARNINGS

#include <iostream>
#include <string>
#include <vector>
#include <cstring>
using namespace std;
class MyString
{
private:
    char *data;
    size_t size;

public:
    MyString(const char *str)
    {
        size = std::strlen(str);
        data = new char[size + 1];
        std::strcpy(data, str);
    }

    ~MyString()
    {
        delete[] data;
    }

    size_t getSize() const { return size; }
    const char *getData() const { return data; }
};
int main()
{
    MyString txt("Hello");
    string myGraphJson = "{\"kind\":{\"graph\":true},"
                         "\"nodes\":[{\"id\":\"1\"},{\"id\":\"2\"}],"
                         "\"edges\":[{\"from\":\"1\",\"to\":\"2\"}]}";

    ////////////////////////////////////
    // Use this exp: myGraphJson._Bx._Ptr
    ///////////////////////////////////
    cout << myGraphJson;
    vector<int> something{12, 34, 3, 545};
    int a = 12;
    int b = a + 23;
    cout << "Hello World !\n";
    cout << "28tech tutorial !" << endl;
    return 0;
}