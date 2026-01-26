const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
     required: true,
  },
  photos:{
    type: [String],
     required: true,
  },
  rent: { //租金
    type: Number,
    required: true,
  },
   size: { 
    type: Number,
    required: true,
  },
   noofroom: { //幾房
    type: Number,
    required: true,
  },
   nooflivingroom: { //幾廳
    type: Number,
    required: true,
  },
  address: { //地址
    type: String,
    required: true,
  },
  status: { //狀態
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

propertySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Property', propertySchema);