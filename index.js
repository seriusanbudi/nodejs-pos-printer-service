const escpos = require('escpos');
const express = require('express');
const config = require('./config');

const device = new escpos.USB(config.pid, config.vid);
const printer = new escpos.Printer(device);

const app = express()
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.post('/print', (req, res) => {
  res.send({status: "printing"})

  const {
    store_name,
    store_address,
    store_phone,

    code,
    items={},
    total,
    change,
    pay,
    dpp,
    ppn,
    payment_method,
  } = req.body;

  device.open(function(){
    printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(1, 1);

    printer
      .text(store_name)
      .text(store_address)
      .text(store_phone)
      .text("---------------------------------");

    printer
      .text(code)
      .text(new Date().toLocaleString())
      .text("---------------------------------");

    Object.keys(items).forEach(function(key) {
      printer.tableCustom([ 
        { text: items[key].name.substr(0, 8), align:"LEFT", width:0.2 },
        { text: items[key].qty, align:"LEFT", width:0.05 },
        { text: items[key].price, align:"LEFT", width:0.2 },
        { text: items[key].sub_total, align:"RIGHT", width:0.2 }
      ])  
    })

    printer.text("---------------------------------");
    
    // printing table footer
    printer.tableCustom([ 
      { text: "TOTAL", align:"LEFT", width:0.2 },
      { text: ":", align:"LEFT", width:0.05 },
      { text: " ", align:"RIGHT", width:0.2 },
      { text: total, align:"RIGHT", width:0.2 }
    ])

    // printing summary
    printer.tableCustom([ 
      { text: payment_method, align:"LEFT", width:0.2 },
      { text: ":", align:"LEFT", width:0.05 },
      { text: " ", align:"RIGHT", width:0.2 },
      { text: pay, align:"RIGHT", width:0.2 }
    ])

    printer.tableCustom([ 
      { text: "KEMBALI", align:"LEFT", width:0.2 },
      { text: ":", align:"LEFT", width:0.05 },
      { text: " ", align:"RIGHT", width:0.2 },
      { text: change, align:"RIGHT", width:0.2 }
    ])

    printer.text("---------------------------------");

    printer.tableCustom([ 
      { text: "DPP", align:"LEFT", width:0.2 },
      { text: ":", align:"LEFT", width:0.05 },
      { text: " ", align:"RIGHT", width:0.2 },
      { text: dpp, align:"RIGHT", width:0.2 }
    ])

    printer.tableCustom([ 
      { text: "PPN", align:"LEFT", width:0.2 },
      { text: ":", align:"LEFT", width:0.05 },
      { text: " ", align:"RIGHT", width:0.2 },
      { text: ppn, align:"RIGHT", width:0.2 }
    ])

    printer.newLine()
    printer.newLine()
    printer.text("Terimakasih")
    printer.text("Silahkan datang kembali")

    printer.cut(true, 8)
    printer.close()
  })

})

app.listen(port, () => console.log(`Printer server start on ${config.port}!`))