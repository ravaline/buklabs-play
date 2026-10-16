(function(root){
'use strict';
class GameEngine {
 constructor(movies,state){this.movies=movies;this.s=state||null;}
 shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 create(names,config){const pool=this.movies.filter(m=>(config.level==='Todas'||m.level===config.level)&&(config.category==='Todas'||m.category===config.category)).map(m=>m.id);if(!pool.length||names.length<2)throw Error('Necesitas dos participantes y películas disponibles.');this.s={version:1,config:{...config},players:names.map(name=>({name,score:0})),pool,deck:this.shuffle(pool),cursor:0,turn:0,status:'ready',revealed:1,remaining:config.seconds*1000,deadline:null,history:[]};return this.s;}
 get movie(){return this.movies.find(m=>m.id===this.s.deck[this.s.cursor]);}
 get player(){return this.s.players[this.s.turn%this.s.players.length];}
 get round(){return Math.floor(this.s.turn/this.s.players.length)+1;}
 get points(){return 6-this.s.revealed;}
 start(now=Date.now()){if(this.s.status!=='ready')return false;this.s.status='playing';this.s.revealed=1;this.s.remaining=this.s.config.seconds*1000;this.s.deadline=this.s.config.seconds?now+this.s.remaining:null;return true;}
 tick(now=Date.now()){if(this.s.status!=='playing'||!this.s.config.seconds)return false;this.s.remaining=Math.max(0,this.s.deadline-now);if(this.s.remaining===0){this.finish('timeout',0);return true;}return false;}
 reveal(now=Date.now()){if(this.s.status!=='playing'||this.tick(now)||this.s.revealed>=5)return false;this.s.revealed++;return true;}
 correct(now=Date.now()){if(this.s.status!=='playing'||this.tick(now))return false;this.finish('correct',this.points);return true;}
 wrong(now=Date.now()){if(this.s.status!=='playing'||this.tick(now))return false;if(this.s.revealed<5)this.s.revealed++;else this.finish('wrong',0);return true;}
 skip(now=Date.now()){if(this.s.status!=='playing'||this.tick(now))return false;this.finish('skip',0);return true;}
 finish(reason,points){if(this.s.status!=='playing')return;this.player.score+=points;this.s.history.push({title:this.movie.title,player:this.player.name,points,reason,clues:this.s.revealed});this.s.status='result';this.s.deadline=null;}
 pause(now=Date.now()){if(this.s.status!=='playing'||this.tick(now))return false;this.s.status='paused';this.s.deadline=null;return true;}
 resume(now=Date.now()){if(this.s.status!=='paused')return false;this.s.status='playing';this.s.deadline=this.s.config.seconds?now+this.s.remaining:null;return true;}
 next(){if(this.s.status!=='result')return false;this.s.turn++;if(this.s.turn>=this.s.players.length*this.s.config.rounds){this.s.status='over';return true;}const last=this.movie.id;this.s.cursor++;if(this.s.cursor>=this.s.deck.length){this.s.deck=this.shuffle(this.s.pool);this.s.cursor=0;if(this.s.deck.length>1&&this.s.deck[0]===last)[this.s.deck[0],this.s.deck[1]]=[this.s.deck[1],this.s.deck[0]];}this.s.revealed=1;this.s.status='ready';return true;}
}
if(typeof module!=='undefined')module.exports=GameEngine;else root.GameEngine=GameEngine;
})(typeof window!=='undefined'?window:globalThis);
