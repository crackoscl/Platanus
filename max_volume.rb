
require 'rest-client'
require 'json'

url = 'https://www.buda.com/api/v2/markets'

def getMarkets(url)
    ids = []
    response = RestClient::Request.execute(method: :get, url:url)
    result = JSON.parse response.to_str
    list = result['markets']
    list.each do |list|
        ids.push(list['id'])
    end
    getVolume(ids)

rescue RestClient::Exception => e       
  puts  e.response.body 
  puts e.response.cod 
end


def getVolume(ids)
    volume = []
    for id in ids
        geturl = 'https://www.buda.com/api/v2/markets/'+id+'/volume'
            response = RestClient::Request.execute(method: :get, url:geturl)
        result = JSON.parse response.to_str   
        listV = result['volume']
        max = [listV['ask_volume_24h'][0],listV['bid_volume_24h'][0]].max
        volume.push(
                market_id:listV['market_id'],
                max_volume_24h: max,
                
        )
    end

puts volume

rescue RestClient::Exception => e       
    puts  e.response.body 
    puts e.response.cod 
end

getMarkets(url)
