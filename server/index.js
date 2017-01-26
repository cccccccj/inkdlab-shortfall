var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');

var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
//var mongoURI = 'mongodb://localhost:27017/shortfall';
var mongoURI = 'mongodb://heroku_s1ccnbfm:a8gume9k8ua7fijmdpjkfs0hr4@ds131109.mlab.com:31109/heroku_s1ccnbfm';

app.set('port', (process.env.PORT || 8080));

app.use(express.static(path.join(__dirname, '../client')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client', '/index.html'));
});

//server.listen(8080, function() {
//   console.log('Listening on port %s...', server.address().port); 
//});

var db, users, gameData, events;
var companies, negotiations, transactions, messages;
var sockets = {};
var homeSocket, gameSocket, adminSocket;
var parts = ['Chassis', 'Exhaust', 'Transmission', 'Engine'];

MongoClient.connect(mongoURI, function(err, database) {
    if (err) {
        console.log('Unable to connect to MongoDB server. Error:', err);
        throw err;
    } else {
        console.log('Connected to MongoDB server.', mongoURI);
        
        app.listen(app.get('port'), function() {
            console.log('App running on ', app.get('port'));
        });
        
        db = database;
        
        users = db.collection('users');
        gameData = db.collection('gameData');
        events = db.collection('events');
        companies = db.collection('companies');
        negotiations = db.collection('negotiations');
        transactions = db.collection('transactions');
        messages = db.collection('messages');
        
        var counter = 0; // Counter for company
        
        homeSocket = io.of('/home');
        
        homeSocket.on('connection', function (socket) {
            
            socket.on('user.signup', function(data) {
                var taken = [];
                users.findOne({email: data.email, type: data.type}, function(err, doc1) {
                    if (doc1) {
                        taken.push('email');
                    }
                    users.findOne({username: data.username, type: data.type}, function(err, doc2) {
                        if (doc2) {
                            taken.push('username');
                        }
                        if (taken.length) {
                            socket.emit('signup.error', taken);
                        } else {
                            users.insertOne(data, function() {
                                var part = parts[counter % parts.length];
                                counter++; 
                                 
                                companies.insertOne({username: data.username, company: '', part: part, player: 'human'}, function() {
                                    socket.emit('redirect', {username: data.username, type: data.type});
                                });
                            });
                        }
                    });

                });
            });
            
            socket.on('user.login', function(data) {
                users.findOne({username: data.username, type: data.type}, function(err, doc) {
                    if (doc) {
                        if (data.password === doc.password) {
                            socket.emit('redirect', {username: data.username, type: data.type});
                        } else {
                            socket.emit('login.error', 'password');
                        }
                    } else {
                        socket.emit('login.error', 'username');
                    }
                });
            });
        });
        
		gameSocket = io.of('/game');

        gameSocket.on('connection', function(socket) {
            
            sockets[socket.id] = socket;     
            
            socket.on('game.start', function(username) { 
                console.log('A player connected. Socker ID:', socket.id);
                
                gameData.findOne(function(err, gameDoc) {
                   companies.findAndModify({username: username}, [], {$set: {socket: socket.id, online: true}}, {new: true, fields: {_id: 0}}, function(err, result) {
                       var companyDoc = result.value;
                       companies.find({company: {$ne: companyDoc.company}}, {_id: 0, username: 1, company: 1, part: 1, player: 1, online: 1}).toArray(function(err, companiesDocs) {
                           users.findOne({username: username}, {_id: 0, username: 1, photo: 1, type: 1}, function(err, userDoc) {
                               events.findOne({}, {_id: 0}, function(err, eventsDoc) {
                                   socket.emit('gameData.found', {gameData: gameDoc, eventsData: eventsDoc, companyData: companyDoc, companiesData: companiesDocs, userData: userDoc});
                                   socket.broadcast.emit('company.statusChange', {company: companyDoc.company, status: 'online'});
                               });
                           });
                       });
                   }); 
                });

                socket.on('company.set', function(data) {
                    companies.findOne({company: data.company}, function(err, doc) {
                        if (doc) {
                            socket.emit('company.error');
                        } else {
                            companies.update({username: username}, {$set: data}, function() {
                                socket.emit('company.confirm');
                            });
                        }
                    });
                }); 
                
                socket.on('company.update', function(data) {
                    companies.updateOne(data.query, data.update); 
                });
                
                socket.on('inventory.update', function(data) {
                    companies.findOne({company: data.company}, function(err, doc) {
                        var partInventory = doc.inventory[data.part];
                        console.log(partInventory);
                        var index = partInventory.findIndex(x => (x.mechQuality == data.mechQuality) && (x.greenScore == data.greenScore));
                        if (index != -1) {
                            partInventory[index].quantity += data.quantity;
                            if (partInventory[index].quantity == 0) {
                                partInventory.splice(index, 1);
                            }
                        } else {
                            partInventory.push({mechQuality: data.mechQuality, greenScore: data.greenScore, quantity: data.quantity});
                        }
                        
                        companies.updateOne({company: data.company}, {$set: {inventory: doc.inventory}}, function() {
                            if (doc.online) {
                                sockets[doc.socket].emit('inventory.updated', {part: data.part, newInventory: partInventory});
                            }
                        });
                        console.log(partInventory);
                        
                        
                    });
                });

                socket.on('negotiations.find', function(data) {
                    negotiations.find(data.query, data.filter).toArray(function(err, docs) {
                       socket.emit(data.event, docs); 
                    });
                });

                socket.on('negotiation.insert', function(data) {
                    companies.findOne({company: data.toCompany}, function(err, doc) {
                        if (doc.online) {
                            sockets[doc.socket].emit(data.event, data.offer);
                        }
                        negotiations.insertOne(data.offer);
                    });
                });
                
                socket.on('negotiation.update', function(data) {
                    negotiations.updateOne({id: data.id}, {$set: data.update}, function() {
                        companies.findOne({company: data.toCompany}, function(err, doc) {
                            if (doc.online) {
                                sockets[doc.socket].emit(data.event, {id: data.id, update: data.update});
                            }  
                        });
                    }); 
                });
                
                socket.on('order.new', function(order) {
                   companies.findOne({company: order.saleCompany}, function(err, doc1) {
                      companies.findOne({company: order.purchaseCompany}, function(err, doc2) {
                         if (doc1.online) {
                             sockets[doc1.socket].emit('saleOrder.new', order);
                         }
                         if (doc2.online) {
                             sockets[doc2.socket].emit('purchaseOrder.new', order);
                         } 
                      });
                   });
                });

                socket.on('transactions.find', function(data) {
                    transactions.find(data.query, data.options).toArray(function(err, docs) {
                       socket.emit(data.event, docs); 
                    });   
                });
                
                socket.on('transaction.insert', function(transaction) {
                    transactions.insertOne(transaction, function() {
                        companies.findAndModify({company: transaction.fromCompany}, [], {$inc: {balance: -transaction.amount}}, function(err, doc1) {
                            if (doc1.value.online) {
                                sockets[doc1.value.socket].emit('transaction.new', transaction);
                            }
                            if (transaction.toCompany) {
                                companies.findAndModify({company: transaction.toCompany}, [], {$inc: {balance: transaction.amount}}, function(err, doc2) {
                                    if (doc2.value.online) {
                                        sockets[doc2.value.socket].emit('transaction.new', transaction);
                                    }
                                });
                            }
                        });

                    }); 
                });

                socket.on('disconnect', function() {
                    console.log('A player disconnected. Socker ID:', socket.id);

                    delete sockets[socket.id];

                    companies.findAndModify({socket: socket.id}, [], {$set: {socket: null, online: false}}, function(err, doc) {
                        if (err) console.log(err);
                        gameSocket.emit('company.statusChange', {company: doc.value.company, status: 'offline'});
                    });
                });
            });
            
            addChatEventListeners(socket);
        });
        
        adminSocket = io.of('/admin');
        
        adminSocket.on('connection', function(socket) {
            
            sockets[socket.id] = socket;    
            
            socket.on('admin.start', function(username) {
                console.log('Admin connected. Socker ID:', socket.id);
                
                gameData.findAndModify({}, [], {$set: {admin: username, adminSocket: socket.id, adminOnline: true}}, {new: true, fields: {_id: 0, adminSocket: 0, adminOnline: 0}}, function(err, result) {
                    var gameDoc = result.value;
                    companies.find({}, {_id: 0, username: 1, company: 1, part: 1, player: 1, online: 1}).toArray(function(err, companiesDocs) {
                        users.findOne({username: username}, {_id: 0, username: 1, photo: 1, type: 1}, function(err, userDoc) {
                            events.findOne({}, {_id: 0}, function(err, eventsDoc) {
                                socket.emit('adminData.found', {gameData: gameDoc, eventsData: eventsDoc, companiesData: companiesDocs, userData: userDoc});
                                socket.broadcast.emit('admin.statusChange', {status: 'online'});
                            });
                        });
                    });
                }); 
                
                socket.on('settings.change', function(data) {
                    gameData.updateOne({}, {$set: data});
                });
                          
                socket.on('round.change', function(minutes) {
                    if (minutes > 0) {
                        gameSocket.emit('round.timer', minutes);    
                    }
                    
                    setTimeout(function() {
                        gameData.updateOne({}, {$inc: {currentRound: 1}}, function() {
                            gameSocket.emit('round.changed');
                        });
                    }, minutes*60*1000);
                });
                
                socket.on('events.update', function(data) {
                    gameData.updateOne({}, {$set: {events: data}});
                });
                
                socket.on('disconnect', function() {
                    console.log('Admin disconnected. Socker ID:', socket.id);

                    delete sockets[socket.id];

                    gameData.updateOne({}, [], {$set: {adminSocket: null, adminOnline: false}}, function() {
                        gameSocket.emit('admin.statusChange', {status: 'offline'});
                    });
                });
                
                addChatEventListeners(socket);
            });
        });
        
        function addChatEventListeners(socket) {
            
            socket.on('chats.find', function (data) { 
                messages.find(data.query, data.options).toArray(function(err, docs) {
                    socket.emit(data.event, docs);
                });
            });

            socket.on('chat.send', function (chat) {
                messages.insertOne(chat, function() {
                    if (chat.toCompany === 'Public') {
                        if (chat.fromCompany === 'Admin') {
                            gameSocket.emit('chat.received', chat);
                        } else {
                            adminSocket.emit('chat.received', chat);
                        }
                        socket.broadcast.emit('chat.received', chat);
                    } else if (chat.toCompany === 'Admin') {
                        adminSocket.emit('chat.received', chat);
                    } else {
                        companies.findOne({company: chat.toCompany}, function(err, doc) {
                           if (doc.online) {
                               sockets[doc.socket].emit('chat.received', chat);
                           } 
                        });
                    }

                    var logs = chat.username + ' | ' + chat.fromCompany + ' to ' + chat.toCompany + ' (' + chat.time + '): ' + chat.message + '\r\n';
                    fs.appendFile('logs.txt', logs, function(err) {});
                });
            });
        }
    }
});
     
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});