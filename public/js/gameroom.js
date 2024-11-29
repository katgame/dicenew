var gameroom = function(){

    var _html = $(` <table
      id="scoreboard"
      class="min-w-full text-sm text-left text-gray-400 bg-zinc-900 border border-gray-700 rounded-lg"
    >
      <thead class="bg-zinc-700 text-gray-200">
        <tr>
          <th data-field="turn" scope="col" class="px-6 py-3">Turn</th>
          <th data-field="name" scope="col" class="px-6 py-3">Player Name</th>
          <th data-field="id" scope="col" class="px-6 py-3">Player Unique ID</th>
          <th data-field="type" scope="col" class="px-6 py-3">Player Type</th>
          <th data-field="currentScore" scope="col" class="px-6 py-3">Current Score</th>
          <th data-field="score" scope="col" class="px-6 py-3">Total Score</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>`)

    function create(playerData)
    {
        // update player data 
        console.log("data in gameroom ",playerData)
      
        $(_html).bootstrapTable({
            data: playerData
        });
        
    }

    function setTurn(playerData)
    {
        // update player data 
        console.log("data for turn ",playerData)
        $(_html).bootstrapTable("destroy");
        $(_html).bootstrapTable({
            data: playerData
        });
        $(_html).bootstrapTable('refresh')
    }


    function update(playerData){
        // update player data 
        console.log("data in gameroom ",playerData)
        $(_html).bootstrapTable("destroy");
        $(_html).bootstrapTable({
            data: playerData
        });
        $(_html).bootstrapTable('refresh')
    }


    return{
        getHtml:function(){
            return _html;
        },
        update:update,
        create:create,
        setTurn:setTurn
    }
}