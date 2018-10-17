var fs = require('fs');

var stream = new fs.ReadStream('nono.html');

stream.on('readable', function()
{
  while(null !== (data = stream.read()))
  {
    console.log(data.length);
  }
});

stream.on('end', function()
{
  console.log("THE END");
});

stream.on('error', function(err)
{
  if(err.code == 'ENOENT')
  {
    console.log("Файл не найден, попинайте админа, пусть выложит ..");
  }
  else
  {
    console.error(err);
  }
});