var express = require('express');
var router = express.Router();
var amqp = require('amqplib/callback_api');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/receive", function(req, res, next) {
  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      next(error0);
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        next(error1);
      }
      var queue = 'hello';
  
      channel.assertQueue(queue, {
        durable: false
      });

      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
      channel.consume(queue, function(msg) {
        console.log(" [x] Received %s", msg.content.toString());
      }, {
          noAck: true
      });
      res.send("meesages consumed successfully");
    });
  });
});


router.post('/receive_task_queue', function(req, res, next) {
  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      next(error0);
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        next(error1);
      }
      var queue = 'task_queue';

      channel.assertQueue(queue, {
        durable: true
      });
      channel.prefetch(1);
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
      channel.consume(queue, function(msg) {
        var secs = msg.content.toString().split('.').length - 1;

        console.log(" [x] Received %s", msg.content.toString());
        setTimeout(function() {
          console.log(" [x] Done");
          channel.ack(msg);
        }, secs * 1000);
        res.send("meesages consumed successfully");
      }, {
        // manual acknowledgment mode,
        // see /docs/confirms for details
        noAck: false
      });
    });
  });
});

module.exports = router;
