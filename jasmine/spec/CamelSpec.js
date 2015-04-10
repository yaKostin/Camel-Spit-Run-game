describe("Player", function() {
  var game;

  beforeEach(function() {
    game = new CamelGame();
  });

  it("should be able to play a Song", function() {
    game.tooglePaused();
    expect(game.paused).toBe(false);
  });
});