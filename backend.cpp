#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <winsock2.h>

#pragma comment(lib, "ws2_32.lib")

using namespace std;

// ==========================================
// Function: Username already exists?
// ==========================================
bool userExists(string username) {

    ifstream file("players.txt");

    string storedUser, storedPass;

    while (file >> storedUser >> storedPass) {

        if (storedUser == username) {
            file.close();
            return true;
        }
    }

    file.close();
    return false;
}

// ==========================================
// Function: Login Verification
// ==========================================
bool verifyLogin(string username, string password) {

    ifstream file("players.txt");

    string storedUser, storedPass;

    while (file >> storedUser >> storedPass) {

        if (storedUser == username &&
            storedPass == password) {

            file.close();
            return true;
        }
    }

    file.close();
    return false;
}

// ==========================================
// MAIN SERVER
// ==========================================
int main() {

    WSADATA wsaData;
    WSAStartup(MAKEWORD(2,2), &wsaData);

    SOCKET serverSocket = socket(AF_INET, SOCK_STREAM, 0);

    sockaddr_in serverAddr;

    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(8080);

    bind(serverSocket,
         (sockaddr*)&serverAddr,
         sizeof(serverAddr));

    listen(serverSocket, 5);

    cout << "====================================" << endl;
    cout << " C++ LOGIN SERVER STARTED (8080) " << endl;
    cout << "====================================" << endl;

    while (true) {

        SOCKET clientSocket =
            accept(serverSocket, nullptr, nullptr);

        char buffer[4096] = {0};

        recv(clientSocket, buffer, 4096, 0);

        string request(buffer);

        string httpResponse =
            "HTTP/1.1 200 OK\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Content-Type: text/plain\r\n"
            "Connection: close\r\n\r\n";

        // ==========================================
        // BODY EXTRACT
        // ==========================================
        size_t bodyPos = request.find("\r\n\r\n");

        string body = "";

        if (bodyPos != string::npos) {
            body = request.substr(bodyPos + 4);
        }

        string username = "";
        string password = "";

        size_t uPos = body.find("username=");
        size_t pPos = body.find("&password=");

        if (uPos != string::npos &&
            pPos != string::npos) {

            username =
                body.substr(uPos + 9,
                pPos - (uPos + 9));

            password =
                body.substr(pPos + 10);
        }

        // ==========================================
        // REGISTER ROUTE
        // ==========================================
        if (request.find("POST /register")
            != string::npos) {

            if (userExists(username)) {

                httpResponse +=
                    "Username already exists!";

            } else {

                ofstream file("players.txt", ios::app);

                file << username
                     << " "
                     << password
                     << endl;

                file.close();

                cout << "NEW USER REGISTERED: "
                     << username << endl;

                httpResponse +=
                    "Registration Successful";
            }
        }

        // ==========================================
        // LOGIN ROUTE
        // ==========================================
        else if (request.find("POST /login")
                 != string::npos) {

            if (verifyLogin(username, password)) {

                cout << "LOGIN SUCCESS: "
                     << username << endl;

                httpResponse +=
                    "Login Successful";

            } else {

                httpResponse +=
                    "Invalid Username or Password!";
            }
        }

        else {

            httpResponse +=
                "Unknown Request!";
        }

        send(clientSocket,
             httpResponse.c_str(),
             httpResponse.length(),
             0);

        closesocket(clientSocket);
    }

    closesocket(serverSocket);

    WSACleanup();

    return 0;
}